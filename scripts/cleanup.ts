#!/usr/bin/env zx
import { $ } from 'zx';

// eslint-disable-next-line no-unused-expressions
$`pnpm rimraf node_modules packages/**/node_modules dist ./**/dist pnpm-local.yaml packages/**/pnpm-lock.yaml`;
