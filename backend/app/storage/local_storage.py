from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import get_settings


def save_upload_file(deal_id: int, upload: UploadFile) -> tuple[str, str]:
    original_name = Path(upload.filename or "document").name
    suffix = Path(original_name).suffix.lower()
    stored_name = f"{uuid4().hex}{suffix}"

    base_dir = Path(get_settings().document_storage_dir) / str(deal_id)
    base_dir.mkdir(parents=True, exist_ok=True)

    file_path = base_dir / stored_name
    with file_path.open("wb") as output:
        while chunk := upload.file.read(1024 * 1024):
            output.write(chunk)

    return stored_name, str(file_path)
