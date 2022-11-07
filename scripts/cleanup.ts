#!/usr/bin/env zx
import { $ } from 'zx';

$`pnpm rimraf node_modules packages/**/node_modules dist ./**/dist pnpm-lock.yaml packages/**/pnpm-lock.yaml`;
