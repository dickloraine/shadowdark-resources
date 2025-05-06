# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "typer",
#     "pybase64",
#     "mistune",
# ]
# ///

import json
import os
import re
import shutil
import subprocess
from contextlib import contextmanager
from enum import Enum, auto
from functools import partial
from pathlib import Path
from textwrap import dedent, indent
from typing import Annotated, Any, Callable, Optional

import mistune
import pybase64
import typer
from rich import print


class ImageType(Enum):
    MARKDOWN = auto()
    OBSIDIAN = auto()
    HTML = auto()
    BASE64 = auto()


app = typer.Typer(
    rich_markup_mode="rich",
    context_settings={"help_option_names": ["-h", "--help"]},
    add_completion=False,
)


# ------------------------------------------------------------------------------------- #
#                                      COMMANDLINE                                      #
# ------------------------------------------------------------------------------------- #


# -------------------------------------- Markdown ------------------------------------- #
@app.command()
def markdown(
    output_dir: Annotated[Path, typer.Argument(show_default=False)],
    clear_output: Annotated[
        bool,
        typer.Option(
            help="Clear the output directory before conversion",
        ),
    ] = True,
    split_files: Annotated[
        bool,
        typer.Option(
            "--split-files",
            "-s",
            help="Each entry will be split into a separate file",
        ),
    ] = False,
    no_single_file: Annotated[
        bool,
        typer.Option(
            "--no-single-file",
            "-n",
            help="Do not create a single file in split files mode.",
        ),
    ] = False,
    images: Annotated[
        bool,
        typer.Option(
            "--images",
            "-i",
            help="Include image links",
        ),
    ] = False,
    copy_images: Annotated[
        bool,
        typer.Option(
            "--copy-images",
            "-c",
            help="Copy images to the output directory",
        ),
    ] = False,
    images_dir: Annotated[
        Path,
        typer.Option(
            help="The image source directory.",
        ),
    ] = Path.cwd() / "tokens",
    alternative_layout: Annotated[
        bool,
        typer.Option(
            help="Render bestiary stats as a table.",
        ),
    ] = False,
    obsidian: Annotated[
        bool,
        typer.Option(
            "--obsidian",
            "-o",
            help="Use obsidian markdwon.",
        ),
    ] = False,
    uppercase_headers: Annotated[
        bool,
        typer.Option(
            help="Entry titles are in uppercase.",
        ),
    ] = True,
    header_level: Annotated[
        int,
        typer.Option(
            help="Set the highest header level.",
        ),
    ] = 1,
) -> None:
    """
    Convert a JSON file with data to markdown.
    """
    create = partial(
        create_markdown_,
        split_files,
        no_single_file,
        obsidian,
        uppercase_headers,
        header_level,
    )
    prep = partial(prepare_data_markdown, output_dir, split_files)

    if clear_output and output_dir.exists():
        shutil.rmtree(output_dir)

    bestiary_data, bestiary_path = prepare_image_data_markdown(
        "data/bestiary_data.json",
        "Bestiary",
        output_dir,
        split_files,
        images,
        copy_images,
        images_dir,
        obsidian,
    )
    create(
        "Bestiary",
        bestiary_data,
        bestiary_path,
        get_monster_markdown_alternative
        if alternative_layout
        else get_monster_markdown,
    )
    create("Spells", *prep("data/spell_data.json", "Spells"), get_spell_markdown)
    create("Items", *prep("data/item_data.json", "Items"), get_item_markdown)


# ---------------------------------------- HTML --------------------------------------- #
@app.command()
def html(
    output_dir: Annotated[Path, typer.Argument(show_default=False)],
    standalone: Annotated[
        bool,
        typer.Option(
            "--standalone",
            "-a",
            help="Create a single standalone HTML including all resources.",
        ),
    ] = False,
    clear_output: Annotated[
        bool,
        typer.Option(
            help="Clear the output directory before conversion",
        ),
    ] = True,
    images: Annotated[
        bool,
        typer.Option(
            "--images",
            "-i",
            help="Include image links",
        ),
    ] = False,
    images_dir: Annotated[
        Path,
        typer.Option(
            help="The image source directory.",
        ),
    ] = Path.cwd() / "tokens",
    base_url: Annotated[
        str,
        typer.Option(
            "--base-url",
            "-b",
            help="The base url for the site.",
        ),
    ] = "",
    dry_run: Annotated[
        bool,
        typer.Option(
            help="Does not create an output.",
        ),
    ] = False,
) -> None:
    """
    Convert a JSON file with data to html. Needs node.
    """
    output_dir = output_dir.absolute()
    app_dir = Path.cwd() / "app"

    if not (app_dir / "node_modules").exists():
        if shutil.which("npm") is None:
            print("[bold red]Needs node![/bold red]")
            raise typer.Exit(code=1)

        with change_dir(app_dir):
            subprocess.run(["npm", "init"], shell=True)

    public_dir = app_dir / "public"
    shutil.rmtree(public_dir)
    public_dir.mkdir(parents=True, exist_ok=True)
    assets_dir = app_dir / "src" / "assets"
    shutil.rmtree(assets_dir)
    assets_dir.mkdir(parents=True, exist_ok=True)
    if not dry_run:
        if clear_output and output_dir.exists():
            shutil.rmtree(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

    create_web_images(
        "bestiary_data.json",
        ["description"],
        output_dir,
        images_dir,
        images,
        standalone,
    )
    create_web("spell_data.json", ["description"])
    create_web(
        "item_data.json", ["description", "Benefit", "Curse", "Bonus", "Personality"]
    )

    build_web(output_dir, standalone, images, base_url, dry_run)


# ---------------------------------------- PDF ---------------------------------------- #
@app.command()
def pdf(
    output_dir: Annotated[Path, typer.Argument(show_default=False)],
    clear_output: Annotated[
        bool,
        typer.Option(
            help="Clear the output directory before conversion",
        ),
    ] = True,
) -> None:
    """
    Convert a JSON file with data to pdf. Needs quarto.
    """

    def get_text(
        file: str, conversion_function: Callable[[str, bool, bool, int], str]
    ) -> str:
        data, _ = prepare_data_markdown(output_dir, False, file, "")
        text = ""
        for el in data:
            text += conversion_function(el, False, True, 2)
        return text

    if shutil.which("quarto") is None:
        print("[bold red]Needs quarto![/bold red]")
        raise typer.Exit(code=1)

    if clear_output and output_dir.exists():
        shutil.rmtree(output_dir)

    template_dir = Path.cwd() / "templates" / "pdf"
    bestiary_text = get_text("data/bestiary_data.json", get_monster_markdown)
    spell_text = get_text("data/spell_data.json", get_spell_markdown)
    item_text = get_text("data/item_data.json", get_item_markdown)

    template: str = (template_dir / "pdf_template.md").read_text(encoding="utf-8")
    template = template.replace("BESTIARY_CONTENT", bestiary_text)
    template = template.replace("SPELL_CONTENT", spell_text)
    template = template.replace("ITEM_CONTENT", item_text)

    temp_file = output_dir / "Shadowdark_Resources.md"
    temp_file.write_text(template, encoding="utf-8")
    shutil.copytree(template_dir, output_dir / "template")
    with change_dir(output_dir):
        subprocess.run(["quarto", "render", temp_file.name], shell=True)
    temp_file.unlink()
    shutil.rmtree(output_dir / "template")


# ------------------------------------------------------------------------------------- #
#                                          MAIN                                         #
# ------------------------------------------------------------------------------------- #


# ----------------------------------- CREATE OUTPUT ----------------------------------- #
def create_markdown_(
    split_files: bool,
    no_single_file: bool,
    obsidian: bool,
    uppercase_headers: bool,
    header_level: int,
    title: str,
    data: Any,
    output_dir: Path,
    conversion_function: Callable[[str, bool, bool, int], str],
):
    if not split_files or not no_single_file:
        markdown = f"{'#' * header_level} {title}\n\n"
        for el in data:
            markdown += conversion_function(el, False, uppercase_headers, header_level)
        (output_dir / f"{title}.md").write_text(markdown, encoding="utf-8")

    if split_files:
        for el in data:
            markdown = conversion_function(
                el, obsidian, uppercase_headers, header_level
            )
            (output_dir / f"{el['name']}.md").write_text(markdown, encoding="utf-8")


def create_web(data_file: str, markdown_fields: list[str]):
    data = get_data_web(data_file, markdown_fields)
    data = json.dumps(data, indent=2, ensure_ascii=False)
    (Path.cwd() / "app" / "src" / "assets" / data_file).write_text(
        data, encoding="utf-8"
    )


def create_web_images(
    data_file: str,
    markdown_fields: list[str],
    output_dir: Path,
    images_dir: Path,
    images: bool,
    standalone: bool,
):
    data = get_data_web(data_file, markdown_fields)

    images_dir = images_dir.absolute()
    image_files: list[Path] = add_images(
        data,
        images_dir if images else None,
        ImageType.BASE64 if standalone else ImageType.HTML,
        output_dir,
        True,
    )
    copy_image_files(image_files, (Path.cwd() / "app" / "public"))

    data = json.dumps(data, indent=2, ensure_ascii=False)
    (Path.cwd() / "app" / "src" / "assets" / data_file).write_text(
        data, encoding="utf-8"
    )


def get_data_web(data_file: str, markdown_fields: list[str]):
    data = sorted(
        json.loads((Path.cwd() / "data" / data_file).read_text(encoding="utf-8")),
        key=lambda x: x["name"],
    )
    data = applyMarkdownToHTML(data, markdown_fields)
    for el in data:
        el["slug"] = el["name"].lower().replace(", ", "-").replace(" ", "-")
    return data


def update_css(standalone: bool, images: bool):
    cwd = Path.cwd()
    fonts = cwd / "fonts"

    css: str = (cwd / "templates" / "html" / "style.css").read_text(encoding="utf-8")
    css = sub_choice(css, "STANDALONE", standalone)
    css = sub_choice(css, "IMAGES", images)

    if standalone:
        for font in fonts.glob("*.css"):
            css = font.read_text(encoding="utf-8") + css
    (cwd / "app" / "src" / "style.css").write_text(css, encoding="utf-8")


def build_web(
    output_dir: Path,
    standalone: bool,
    images: bool,
    base_url: str,
    dry_run: bool,
):
    cwd = Path.cwd()
    app = cwd / "app/"

    config = (cwd / "templates" / "html" / "vite.config.js").read_text(encoding="utf-8")
    config = sub_choice(config, "STANDALONE", standalone)
    config = sub_choice(config, "BASEURL", base_url != "")
    config = config.replace("APP_BASE_URL", base_url)
    (app / "vite.config.js").write_text(config, encoding="utf-8")
    update_css(standalone, images)

    with change_dir(app):
        subprocess.run(["npm", "run", "build"], shell=True)

    if dry_run:
        pass
    elif standalone:
        shutil.copy(app / "dist/index.html", output_dir / "shadowdark_resources.html")
    else:
        shutil.copytree(app / "dist", output_dir, dirs_exist_ok=True)


# ------------------------------ Data Preperation Helpers ----------------------------- #
def prepare_data_markdown(
    output_dir: Path, split_files: bool, data_file: str, subdir: str = ""
) -> tuple[Any, Path]:
    data = sorted(
        json.loads(Path(data_file).read_text(encoding="utf-8")),
        key=lambda x: x["name"],
    )
    output_dir = output_dir / subdir if split_files else output_dir
    output_dir = output_dir.absolute()
    output_dir.mkdir(parents=True, exist_ok=True)
    return (data, output_dir)


def prepare_image_data_markdown(
    data_file: str,
    subdir: str,
    output_dir: Path,
    split_files: bool,
    images: bool,
    copy_images: bool,
    images_dir: Path,
    obsidian: bool,
):
    data, output_dir = prepare_data_markdown(output_dir, split_files, data_file, subdir)

    image_files: list[Path] = add_images(
        data,
        images_dir if images else None,
        ImageType.OBSIDIAN if obsidian else ImageType.MARKDOWN,
        output_dir,
        copy_images,
        obsidian,
        subdir if obsidian else "",
    )
    copy_image_files(image_files, output_dir)

    return (data, output_dir)


# ------------------------------------------------------------------------------------- #
#                                       RESOURCES                                       #
# ------------------------------------------------------------------------------------- #


# -------------------------------------- BESTIARY ------------------------------------- #
def get_monster_metadata(m: Any) -> str:
    (s, d, c, i, w, ch) = get_monster_stats(m)

    markdown = dedent(f"""\
        ---
        name: "{m["name"]}"
        layout: "Shadowdark"
        statblock: true
        Description: "{m["description"]}"
        Portrait: "{m["image"]}"
        ac: {m["ac"]}{" (" + m["armor_type"] + ")" if m["armor_type"] else ""}
        hp: {m["hp"]}
        ATK: "{m["attack"]}"
        MV: "{m["movement"]}"
        Stats: [{s}, {d}, {c}, {i}, {w}, {ch}]
        AL: {m["alignment"][0]}
        LV: {m["level"]}
        Source: "{m["source"]}"
        Abilities:
    """)
    for a in m["actions"]:
        markdown += indent(
            dedent(f"""\
                - name: "{a["name"]}"
                  desc: "{a["description"]}"
                """),
            "  ",
        )
    markdown += "---\n\n"
    return markdown


def get_monster_markdown(
    m: Any,
    metadata: bool = False,
    uppercase_headers: bool = True,
    header_level: int = 1,
) -> str:
    (s, d, c, i, w, ch) = get_monster_stats(m)

    markdown = ""

    if metadata:
        markdown += get_monster_metadata(m)

    markdown += f"{'#' * (header_level + 1)} {m['name'].upper() if uppercase_headers else m['name']}\n\n"

    if "image" in m and m["image"]:
        markdown += f"!{m['image']}\n\n"

    markdown += dedent(f"""\
        _{m["description"]}_

        **AC** {m["ac"]}{" (" + m["armor_type"] + ")" if m["armor_type"] else ""}, **HP** {m["hp"]}, **ATK** {m["attack"]}, **MV** {m["movement"]}, **S** {s} **D** {d} **C** {c} **I** {i} **W** {w} **Ch** {ch}, **AL** {m["alignment"][0]}, **LV** {m["level"]}
        
    """)
    for a in m["actions"]:
        markdown += f"**{a['name']}:** {a['description']}\n\n"
    return markdown


def get_monster_markdown_alternative(
    m: Any,
    metadata: bool = False,
    uppercase_headers: bool = True,
    header_level: int = 1,
) -> str:
    (s, d, c, i, w, ch) = get_monster_stats(m)

    markdown = ""

    if metadata:
        markdown += get_monster_metadata(m)

    markdown += f"{'#' * (header_level + 1)} {m['name'].upper() if uppercase_headers else m['name']}\n\n"

    if "image" in m and m["image"]:
        markdown += f"!{m['image']}\n\n"

    markdown += dedent(f"""\
        _{m["description"]}_

        **LV** {m["level"]}, **AL** {m["alignment"][0]}
        **AC** {m["ac"]}{" (" + m["armor_type"] + ")" if m["armor_type"] else ""}, **HP** {m["hp"]}, **MV** {m["movement"]}
        **ATK** {m["attack"]}

        |  S  |  D  |  C  |  I  |  W  |  Ch  |
        |:---:|:---:|:---:|:---:|:---:|:----:|
        | {s} | {d} | {c} | {i} | {w} | {ch} |

    """)
    for a in m["actions"]:
        markdown += f"**{a['name']}:** {a['description']}\n\n"
    return markdown


def get_monster_stats(m: Any) -> tuple[int, int, int, int, int, int]:
    s = m["stats"]["str"]
    d = m["stats"]["dex"]
    c = m["stats"]["con"]
    i = m["stats"]["int"]
    w = m["stats"]["wis"]
    ch = m["stats"]["cha"]

    return (s, d, c, i, w, ch)


# --------------------------------------- SPELLS -------------------------------------- #
def get_spell_metadata(s: Any) -> str:
    markdown = dedent(f"""\
        ---
        Name: {s["name"]}
        Type: Spell
        Tier: {s["tier"]}
        DC: "{s["dc"]}"
        Description: |
    """)
    markdown += indent(s["description"], "    ")
    markdown += dedent(f"""\
        Duration: "{s["duration"]}"
        Range: "{s["range"]}"
        Classes: {s["classes"]}
        Source: "{s["source"]}"
        ---

    """)
    return markdown


def get_spell_markdown(
    s: Any,
    metadata: bool = False,
    uppercase_headers: bool = True,
    header_level: int = 1,
) -> str:
    markdown = ""

    if metadata:
        markdown += get_spell_metadata(s)

    markdown += dedent(f"""\
        {"#" * (header_level + 1)} {s["name"].upper() if uppercase_headers else s["name"]}
        
        _Tier {s["tier"]}, {", ".join(s["classes"])}_

        **Duration:** {s["duration"]}
        
        **Range:** {s["range"]}

    """)
    markdown += s["description"]
    markdown += "\n\n"
    return markdown


# --------------------------------------- ITEMS --------------------------------------- #
def get_item_metadata(s: Any) -> str:
    effects = [(k, v) for (k, v) in s.items() if k != "name" and k != "description"]

    markdown = dedent(f"""\
        ---
        Name: {s["name"]}
        Type: Item
        Description: "{s["description"]}"
    """)
    for k, v in effects:
        markdown += f'{k}: "{v}"\n'
    markdown += "---\n\n"
    return markdown


def get_item_markdown(
    s: Any,
    metadata: bool = False,
    uppercase_headers: bool = True,
    header_level: int = 1,
) -> str:
    effects = [
        (k, v)
        for (k, v) in s.items()
        if k != "name" and k != "description" and k != "item_type"
    ]
    markdown = ""

    if metadata:
        markdown += get_item_metadata(s)

    markdown += dedent(f"""\
        {"#" * (header_level + 1)} {s["name"].upper() if uppercase_headers else s["name"]}
        
        _{s["description"]}_

    """)
    for k, v in effects:
        markdown += f"**{k}.** {v}\n\n"
    return markdown


# ------------------------------------------------------------------------------------- #
#                                       UTILITIES                                       #
# ------------------------------------------------------------------------------------- #


# -------------------------------------- TEMPLATE ------------------------------------- #


def sub_choice(text: str, alternative: str, selectAlternative: bool = False) -> str:
    return re.sub(
        r"\/\*  NOT "
        + alternative
        + r"  \*\/\s*(.*?)\/\*  "
        + alternative
        + r"  \*\/\s*\/\*\s*(.*?)\s*\*\/\s*\/\*  END  \*\/",
        r"\2" if selectAlternative else r"\1",
        text,
        flags=re.DOTALL,
    )


# --------------------------------------- IMAGE --------------------------------------- #


def add_images(
    monsters: Any,
    images_dir: Optional[Path],
    type: ImageType,
    output_dir: Path,
    copy_images: bool = False,
    obsidian: bool = False,
    prefix: str = "",
) -> list[Path]:
    image_files: list[Path] = []
    for monster in monsters:
        if not images_dir:
            monster["image"] = ""
            continue
        img_path: Path = images_dir / (monster["name"] + ".webp").lower().replace(
            ", ", "-"
        ).replace(" ", "-")
        if not img_path.exists():
            monster["image"] = ""
            continue
        if type == ImageType.BASE64:
            monster["image"] = getImage64(img_path)
            continue

        if copy_images:
            image_files.append(img_path)
        target_path: str = (  # type: ignore
            (Path("images") / img_path.name).as_posix()
            if (copy_images or obsidian)
            else img_path.relative_to(output_dir, walk_up=True).as_posix()  # type: ignore
        )
        match type:
            case ImageType.HTML:
                monster["image"] = target_path
            case ImageType.MARKDOWN:
                monster["image"] = f"[]({target_path})"
            case ImageType.OBSIDIAN:
                monster["image"] = f"[[{prefix}{target_path}|cover ws-med frame right]]"
    return image_files


def getImage64(img_path: Path) -> str:
    with open(img_path, "rb") as img_file:
        img = pybase64.b64encode(img_file.read())
    img = img.decode("utf-8")
    img = "data:image/webp;base64," + img
    return img


def copy_image_files(image_files: list[Path], output_dir: Path) -> None:
    if not image_files:
        return
    if image_files and output_dir != Path.cwd():
        img_dir = output_dir / "images"
        img_dir.mkdir(parents=True, exist_ok=True)
        for img in image_files:
            shutil.copy(img, img_dir / img.name)


# --------------------------------------- Misc. --------------------------------------- #


def applyMarkdownToHTML(el: Any, markdown_fields: list[str] | None) -> Any:
    if markdown_fields is None:
        return el
    if isinstance(el, list):
        el = [applyMarkdownToHTML(e, markdown_fields) for e in el]  # type: ignore
    elif isinstance(el, dict):
        el = {
            k: mistune.html(v).strip()  # type: ignore
            if k in markdown_fields
            else applyMarkdownToHTML(v, markdown_fields)
            for k, v in el.items()  # type: ignore
        }
    return el


@contextmanager
def change_dir(new_dir: Path):
    """Changes to the given directory, returns to the current one after"""
    current_dir = Path.cwd()
    os.chdir(new_dir)
    yield
    os.chdir(current_dir)


if __name__ == "__main__":
    app()
