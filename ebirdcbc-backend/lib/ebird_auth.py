"""
Tools for managing eBird credentials securely
"""

import os
from cryptography.fernet import Fernet


secret_key = os.getenv("SECRET_KEY") or "test_key"


def encrypt_password(plain_password: str):
    fernet = Fernet(secret_key)
    return fernet.encrypt(plain_password.encode("utf-8")).decode("utf-8")


def decrypt_password(cipher_password: str):
    fernet = Fernet(secret_key)
    return fernet.decrypt(cipher_password).decode("utf-8")
