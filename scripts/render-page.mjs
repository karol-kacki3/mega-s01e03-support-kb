import fs from 'node:fs';
import path from 'node:path';
import { render } from 'svelte/server';
import Page, { metadata } from '../src/routes/kb/incidents/4471-review/+page.svx';
import { deskRef } from '../src/lib/kb/desk-ref.ts';

const rendered = render(Page);
const expected = deskRef(metadata.signature);
if (!rendered.body.includes(expected)) throw new Error('The rendered page is missing its real desk reference');
if (rendered.body.includes('no desk ref')) throw new Error('The rendered page is unsigned');
const html = `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${rendered.head}</head><body>${rendered.body}</body></html>\n`;
fs.mkdirSync(path.resolve('rendered'), { recursive: true });
fs.writeFileSync(path.resolve('rendered/4471-review.html'), html);
console.log(`Rendered actual .svx page: rendered/4471-review.html; desk ref ${expected}`);
