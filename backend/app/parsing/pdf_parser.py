import fitz


def extract_pdf_text(file_path: str) -> tuple[str, int]:
    pages: list[str] = []
    with fitz.open(file_path) as document:
        for page in document:
            pages.append(page.get_text().strip())
        return "\n\n".join(page for page in pages if page), document.page_count
