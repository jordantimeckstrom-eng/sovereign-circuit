#!/bin/bash
set -e

echo "==> Installing root dependencies"
npm install

echo "==> Installing client dependencies"
(cd client && npm install)

echo "==> Post-merge setup complete"
