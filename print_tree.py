#!/usr/bin/env python3
import os

# 設定要忽略的目錄（可以根據需求調整）
IGNORE_DIRS = {'node_modules', '.git', 'dist', 'build','.next','next*', 'venv'}

def print_tree(start_path, prefix=""):
    try:
        items = sorted(os.listdir(start_path))
    except PermissionError:
        # 若無權限讀取，直接略過
        return

    # 過濾掉要忽略的目錄或檔案（也可擴充條件）
    items = [item for item in items if item not in IGNORE_DIRS]

    for index, item in enumerate(items):
        item_path = os.path.join(start_path, item)
        connector = "└── " if index == len(items) - 1 else "├── "
        print(prefix + connector + item)
        if os.path.isdir(item_path):
            extension = "    " if index == len(items) - 1 else "│   "
            print_tree(item_path, prefix + extension)

if __name__ == "__main__":
    start_directory = "."  # 或指定其他目錄
    print(start_directory)
    print_tree(start_directory)
