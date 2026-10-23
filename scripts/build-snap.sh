#!/bin/bash
#
# Build the Bruno snap in LXD (npm run build:electron:snap).
# Usage: ./scripts/build-snap.sh [--skip-web]   (--skip-web reuses packages/bruno-app/dist)

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ELECTRON_DIR="$ROOT_DIR/packages/bruno-electron"
WEB_DIST="$ROOT_DIR/packages/bruno-app/dist"
SKIP_WEB=false

die() {
  echo "$*" >&2
  exit 1
}

parse_args() {
  for arg in "$@"; do
    case "$arg" in
      --skip-web) SKIP_WEB=true ;;
      *) die "Unknown argument: $arg" ;;
    esac
  done
}

# Concurrent runs share out/ and would delete each other's files
acquire_lock() {
  exec 9< "$0"
  flock -n 9 || die "Another snap build is running in this checkout"
}

check_prerequisites() {
  command -v snapcraft > /dev/null || die "snapcraft is not installed: sudo snap install snapcraft --classic"
  snap list lxd > /dev/null 2>&1 || die "LXD is not installed: sudo snap install lxd && sudo lxd init --auto && sudo usermod -aG lxd \$USER (then log in again)"
}

build_web() {
  if [ "$SKIP_WEB" = false ]; then
    (cd "$ROOT_DIR" && npm run build:web)
  fi
  [ -d "$WEB_DIST" ] || die "$WEB_DIST is missing; run without --skip-web"
}

# Same staging as scripts/build-electron.sh
stage_web() {
  rm -rf "$ELECTRON_DIR/out" "$ELECTRON_DIR/web"
  mkdir "$ELECTRON_DIR/web"
  cp -r "$WEB_DIST"/* "$ELECTRON_DIR/web"
  sed -i'' -e 's@/static/@static/@g' "$ELECTRON_DIR"/web/**.html
  sed -i'' -e 's@/static/font@../../static/font@g' "$ELECTRON_DIR"/web/static/css/**.**.css
  find "$ELECTRON_DIR/web" -name '*.map' -type f -delete
}

# electron-builder writes the snap project, then fails on the renamed `snapcraft snap`
generate_snap_project() {
  (cd "$ELECTRON_DIR" && npx electron-builder --linux snap --config electron-builder-config.js) || true
  SNAP_PROJECT="$(echo "$ELECTRON_DIR"/out/__snap-*)"
  [ -f "$SNAP_PROJECT/snap/snapcraft.yaml" ] || die "electron-builder did not generate a snap project under $ELECTRON_DIR/out"
}

# Output goes inside the project, the only directory the container mounts
pack_snap() {
  local version
  version="$(node -p "require('$ELECTRON_DIR/package.json').version")"
  SNAP_NAME="bruno_${version}_$(dpkg --print-architecture)_linux.snap"
  (cd "$SNAP_PROJECT" && snapcraft pack --use-lxd --output "$SNAP_NAME" < /dev/null)
  mv "$SNAP_PROJECT/$SNAP_NAME" "$ELECTRON_DIR/out/$SNAP_NAME"
}

main() {
  parse_args "$@"
  acquire_lock
  check_prerequisites
  echo "base $(node -p "require('$ELECTRON_DIR/electron-builder-config.js').snap.base"), arch $(dpkg --print-architecture), built in LXD"
  build_web
  stage_web
  generate_snap_project
  pack_snap

  echo
  echo "Built $ELECTRON_DIR/out/$SNAP_NAME"
  echo "Install: sudo snap install --dangerous $ELECTRON_DIR/out/$SNAP_NAME"
  echo "For git over ssh: sudo snap connect bruno:ssh-keys"
}

main "$@"
