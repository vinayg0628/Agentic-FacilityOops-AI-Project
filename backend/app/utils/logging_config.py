import logging
import sys

def setup_logging(level=logging.INFO):
    """Configures application logger with standard formatting."""
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    logging.basicConfig(
        level=level,
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    return logging.getLogger("facilityops")
