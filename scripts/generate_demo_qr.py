#!/usr/bin/env python3
"""Create a printable QR code that opens the hosted Dakhla demo."""

from __future__ import annotations

import sys
from urllib.parse import urlparse


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python3 scripts/generate_demo_qr.py https://your-demo.onrender.com/dakhla")
        return 2

    url = sys.argv[1].strip()
    parsed = urlparse(url)
    if parsed.scheme != "https" or not parsed.netloc:
        print("Please provide the public HTTPS URL of the deployed demo.")
        return 2

    try:
        import qrcode
    except ImportError:
        print('Install the QR package first: python3 -m pip install "qrcode[pil]"')
        return 2

    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=12,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    qr.make_image(fill_color="black", back_color="white").save("demo-qr.png")
    print(f"QR code saved to demo-qr.png → {url}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
