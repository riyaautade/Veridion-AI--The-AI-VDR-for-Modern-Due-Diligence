from docx import Document as DocxDocument


def extract_docx_text(file_path: str) -> tuple[str, int | None]:
    document = DocxDocument(file_path)
    paragraphs = [paragraph.text.strip() for paragraph in document.paragraphs]
    text = "\n".join(paragraph for paragraph in paragraphs if paragraph)
    return text, None
