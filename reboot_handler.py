#!/usr/bin/env python3
"""Update this repository and refresh the deployed HTTP files when needed."""

from datetime import datetime
from pathlib import Path
import subprocess


REPOSITORY = Path(__file__).resolve().parent
LOG_FILE = Path("/home/sfnbg/Documents/logfile.txt")


def log(message):
	LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
	timestamp = datetime.now().astimezone().strftime("%Y-%m-%d %H:%M:%S %Z")
	with LOG_FILE.open("a", encoding="utf-8") as logfile:
		logfile.write(f"[{timestamp}] {message}\n")


def run(command, *, cwd=REPOSITORY):
	return subprocess.run(
		command, cwd=cwd, text=True, stdout=subprocess.PIPE,
		stderr=subprocess.STDOUT, check=False
	)


def main():
	try:
		previous = run(["git", "rev-parse", "HEAD"])
		if previous.returncode:
			log(f"Repository update failed: {previous.stdout.strip()}")
			return

		update = run(["git", "pull"])
		log(
			f"Repository update {'successful' if update.returncode == 0 else 'failed'}"
			f" (git pull, exit {update.returncode}): {update.stdout.strip()}"
		)
		if update.returncode:
			return

		current = run(["git", "rev-parse", "HEAD"])
		if current.returncode:
			log(f"Could not check /http changes: {current.stdout.strip()}")
			return

		changes = run([
			"git", "diff", "--quiet", previous.stdout.strip(),
			current.stdout.strip(), "--", "http/"
		])
		if changes.returncode == 0:
			log("/http files unchanged; copy_http.sh was not run.")
		elif changes.returncode == 1:
			result = run(["bash", str(REPOSITORY / "copy_http.sh")])
			log(
				f"/http files changed; copy_http.sh "
				f"{'successful' if result.returncode == 0 else 'failed'} "
				f"(exit {result.returncode}): {result.stdout.strip()}"
			)
		else:
			log(f"Could not check /http changes: {changes.stdout.strip()}")
	except Exception as error:
		log(f"Script failed: {error}")


if __name__ == "__main__":
	main()
