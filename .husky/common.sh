#!/bin/sh
command_exists () {
  command -v "$1" >/dev/null 2>&1
}

# Workaround for Windows 10, Git Bash and Pnpm
if command_exists winpty && test -t 1; then
  exec < /dev/tty
fi

# Cursor/VS Code 通过 GUI 提交时 PATH 很精简，常找不到 fnm 管理的 node/pnpm
# 这里尽量把常见位置补进 PATH，避免 pre-commit 报 command not found
bootstrap_node_path() {
  # 已有 pnpm 就不用处理
  if command_exists pnpm; then
    return 0
  fi

  # 1) 尝试加载 fnm（Git Bash / sh）
  for fnm_bin in \
    "$HOME/AppData/Local/Microsoft/WinGet/Links/fnm.exe" \
    "/c/Users/$USER/AppData/Local/Microsoft/WinGet/Links/fnm.exe" \
    "fnm"
  do
    if command_exists "$fnm_bin" || [ -x "$fnm_bin" ]; then
      eval "$("$fnm_bin" env --shell bash 2>/dev/null)" && break
    fi
  done

  if command_exists pnpm; then
    return 0
  fi

  # 2) 直接挂上 fnm 默认 Node 目录（比 multishell 路径更稳定）
  for node_dir in \
    "$HOME/AppData/Roaming/fnm/aliases/default" \
    "/c/Users/$USER/AppData/Roaming/fnm/aliases/default"
  do
    if [ -d "$node_dir" ]; then
      export PATH="$node_dir:$PATH"
      break
    fi
  done
}

bootstrap_node_path
