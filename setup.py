import json
import os
import re
import subprocess
import sys

from setup.cli import query_yes_no
from setup.colorConsole import ColorPrint, cyan, magenta


def print_header():
    header = """
    ###################################################
    #########       Raspi Captive Portal      #########
    #########   A Raspberry Pi Access Point   #########
    #########  & Captive Portal setup script  #########
    ###################################################
    """
    ColorPrint.print(cyan, header)


def check_super_user():
    print()
    ColorPrint.print(cyan, "▶ Check sudo")

    # Is root?
    if os.geteuid() != 0:
        print("You need root privileges to run this script.")
        print('Please try again using "sudo"')
        sys.exit(1)
    else:
        print("Running as root user, continue.")


def install_node():
    NODE_JS_VERSION = 22  # EOL: October 2025 (https://nodejs.org/en/about/previous-releases)

    def get_versions():
        res = subprocess.run(["npm", "version", "--json"], capture_output=True, check=True)
        return json.loads(res.stdout)

    print()
    ColorPrint.print(cyan, "▶ Node.js & npm")

    # Already installed?
    data = {}
    try:
        data = get_versions()
        if data["npm"] and data["node"]:
            installed = True
    except Exception:  # pylint: disable=broad-except
        installed = False

    if installed:
        print(f'You have Node.js v{data["node"]} and npm v{data["npm"]} installed.')

        majorVersion = data["node"].split(".")[0]
        if int(majorVersion) < NODE_JS_VERSION:
            answer = query_yes_no(
                f"Would you still like to try installing Node.js v{NODE_JS_VERSION}.x (LTS)?",
                default="yes",
            )
            installed = not answer

    # Install
    if not installed:
        # https://nodejs.org/en/download
        subprocess.run(
            "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash",
            shell=True,
            check=True,
        )
        subprocess.run(
            f". $HOME/.nvm/nvm.sh && nvm install {NODE_JS_VERSION}",
            shell=True,
            check=True,
            executable="/bin/bash",
        )


def setup_access_point():
    print()
    ColorPrint.print(cyan, "▶ Setup Access Point (WiFi)")

    print("We will now set up the Raspi as Access Point to connect to via WiFi.")
    print("The following commands will execute as sudo user.")
    print('Please make sure you look through the file "./access-point/setup-access-point.sh"')
    print("first before approving.")
    answer = query_yes_no("Continue?", default="yes")

    if not answer:
        return sys.exit(0)

    subprocess.run("sudo chmod a+x ./access-point/setup-access-point.sh", shell=True, check=True)
    subprocess.run("./access-point/setup-access-point.sh", shell=True, check=True)


def install_server_dependencies():
    print()
    ColorPrint.print(cyan, "▶ Install Node.js dependencies for backend")

    subprocess.call("npm install", shell=True, cwd="./server")

    # If a frontend exists at ../frontend, build and import it into server/public
    try:
        subprocess.call("npm run build-frontend", shell=True, cwd="./server")
    except Exception:  # pylint: disable=broad-except
        # Non-fatal: continue even if frontend build/import fails
        print("Notice: frontend build/import step failed or was skipped.")


def build_server():
    print()
    ColorPrint.print(cyan, "▶ Build Node.js server (typescript)")

    print("This might take some time...")
    subprocess.call("npm run build", shell=True, cwd="./server")


def setup_server_service():
    print()
    ColorPrint.print(cyan, "▶ Configure Node.js server to start at boot")

    # Replace path in file
    server_path = os.path.join(os.getcwd(), "server")
    server_config_path = "./access-point/access-point-server.service"
    with open(server_config_path, "r", encoding="utf-8") as f:
        filedata = f.read()
    filedata = re.sub(r"WorkingDirectory=.*", f"WorkingDirectory={server_path}", filedata)
    with open(server_config_path, "w", encoding="utf-8") as f:
        f.write(filedata)

    print("We will now register the Node.js app as a Linux service and configure")
    print("it to start at boot time.")
    print("The following commands will execute as sudo user.")
    print('Please make sure you look through the file "./access-point/setup-server.sh"')
    print("first before approving.")
    answer = query_yes_no("Continue?", default="yes")

    if not answer:
        return sys.exit(0)

    subprocess.run("sudo chmod a+x ./setup-server.sh", shell=True, cwd="./access-point", check=True)
    subprocess.run("./setup-server.sh", shell=True, cwd="./access-point", check=True)


def install_python_dependencies():
    print()
    ColorPrint.print(cyan, "▶ Install Python dependencies for keypad")

    # Install RPi.GPIO and requests for the keypad daemon
    subprocess.call("pip3 install RPi.GPIO requests", shell=True)


def setup_keypad_service():
    print()
    ColorPrint.print(cyan, "▶ Configure Keypad DTMF service to start at boot")

    print("We will now install the keypad DTMF scanner as a systemd service.")
    answer = query_yes_no("Continue?", default="yes")

    if not answer:
        return

    subprocess.run("sudo chmod a+x ./setup-keypad.sh", shell=True, cwd="./access-point", check=True)
    subprocess.run("./setup-keypad.sh", shell=True, cwd="./access-point", check=True)


def setup_startup_service():
    print()
    ColorPrint.print(cyan, "▶ Configure boot startup service (starts all services)")

    print("We will now install the startup service that starts all Looped services on every boot.")
    answer = query_yes_no("Continue?", default="yes")

    if not answer:
        return

    subprocess.run("sudo chmod a+x ./setup-startup.sh", shell=True, cwd="./access-point", check=True)
    subprocess.run("./setup-startup.sh", shell=True, cwd="./access-point", check=True)


def done():
    print()
    ColorPrint.print(cyan, "▶ Done")

    final_msg = (
        "Awesome, we are done here. Grab your phone and look for the\n"
        '"Looped Setup" WiFi.'
        "\n"
        "When you reboot the Raspi, wait 2 minutes, then:\n"
        "  - WiFi network will start\n"
        "  - Server will start listening on port 3000\n"
        "  - Keypad scanner will start and listen for key presses\n"
        "\n"
        "Press any key on the 4x4 keypad to hear the DTMF tone.\n"
        "View keypad logs with: sudo journalctl -u looped-keypad -f\n"
        "\n"
        "On subsequent boots, the looped-startup.service will start all services.\n"
        "View startup logs with: sudo journalctl -u looped-startup -f\n"
    )
    ColorPrint.print(magenta, final_msg)



def execute_all():
    print_header()
    check_super_user()

    install_node()
    setup_access_point()

    install_python_dependencies()
    install_server_dependencies()
    build_server()
    setup_server_service()
    setup_keypad_service()
    setup_startup_service()

    done()


if __name__ == "__main__":
    execute_all()
