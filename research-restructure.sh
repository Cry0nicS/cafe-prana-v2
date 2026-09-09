#!/usr/bin/env bash
# Throwaway: move content/ into the locale-prefixed layout of issue #33.
set -euo pipefail
cd "$(dirname "$0")"

mkdir -p content/en/events content/de/events content/en/menu content/de/menu \
         content/en/menu-categories content/de/menu-categories

# Singletons
git mv content/index.md      content/en/index.md
git mv content/index.de.md   content/de/index.md
git mv content/menu.yml      content/en/menu.yml
git mv content/menu.de.yml   content/de/menu.yml
git mv content/events.yml    content/en/events.yml
git mv content/events.de.yml content/de/events.yml

# Per-item collections
for dir in events menu menu-categories; do
  for f in content/$dir/*; do
    base="$(basename "$f")"
    case "$base" in
      *.de.md)  git mv "$f" "content/de/$dir/${base%.de.md}.md" ;;
      *.de.yml) git mv "$f" "content/de/$dir/${base%.de.yml}.yml" ;;
      *)        git mv "$f" "content/en/$dir/$base" ;;
    esac
  done
  rmdir "content/$dir"
done

# content/opening-hours.yml and content/notice.yml stay at the root on purpose.
find content -type f | sort
