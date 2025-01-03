import os

def display_tree(directory, indent=""):
    """Recursively display the directory tree structure."""
    try:
        items = sorted(os.listdir(directory))  # List items in directory
    except PermissionError:
        print(f"{indent}[ACCESS DENIED]")
        return

    for i, item in enumerate(items):
        path = os.path.join(directory, item)
        is_last = (i == len(items) - 1)
        prefix = "└── " if is_last else "├── "
        print(indent + prefix + item)

        if os.path.isdir(path):
            new_indent = indent + ("    " if is_last else "│   ")
            display_tree(path, new_indent)

if __name__ == "__main__":
    root_dir = os.getcwd()  # Get the current working directory
    print(f"Directory tree for: {root_dir}\n")
    display_tree(root_dir)
 