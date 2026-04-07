import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';

function parseArgs(argv) {
  const args = { timeout: 180000 };
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith('--')) {
      args[key] = true;
      continue;
    }
    args[key] = value;
    i += 1;
  }
  args.timeout = Number(args.timeout) || 180000;
  return args;
}

function requireArg(name, value) {
  if (!value || typeof value !== 'string') {
    throw new Error(`Parametro requerido: --${name}`);
  }
}

function toNumberInRange(value, fallback, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

async function waitFichaReady(page, timeout) {
  await page.waitForSelector('.ft-shell', { timeout });
  await page.waitForFunction(
    () => {
      const shell = document.querySelector('.ft-shell');
      const overlay = document.getElementById('loadingOverlay');
      const overlayHidden = !overlay || getComputedStyle(overlay).display === 'none';
      const hasApp = !!window.ftApp && !!window.ftApp.currentUnit;
      return !!shell && overlayHidden && hasApp;
    },
    { timeout }
  );
  await page.waitForTimeout(700);
}

async function main() {
  const args = parseArgs(process.argv);
  requireArg('url', args.url);

  const scale = toNumberInRange(args.scale, 0.6, 0.1, 2);
  const marginTopMm = toNumberInRange(args.marginTopMm, 8, 0, 40);
  const marginRightMm = toNumberInRange(args.marginRightMm, 7, 0, 40);
  const marginBottomMm = toNumberInRange(args.marginBottomMm, 10, 0, 40);
  const marginLeftMm = toNumberInRange(args.marginLeftMm, 7, 0, 40);
  const media = String(args.media || 'print').toLowerCase() === 'screen' ? 'screen' : 'print';
  const page2Scale = args.page2Scale === undefined
    ? null
    : toNumberInRange(args.page2Scale, scale, 0.1, 2);

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=medium']
    });

    const page = await browser.newPage({
      viewport: { width: 1920, height: 1200 },
      deviceScaleFactor: 1.5
    });

    page.setDefaultTimeout(args.timeout);
    await page.emulateMedia({ media });

    await page.goto(args.url, { waitUntil: 'networkidle', timeout: args.timeout });
    await waitFichaReady(page, args.timeout);

    const basePdfBuffer = await page.pdf({
      format: 'A4',
      landscape: false,
      scale,
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: `${marginTopMm}mm`,
        right: `${marginRightMm}mm`,
        bottom: `${marginBottomMm}mm`,
        left: `${marginLeftMm}mm`
      }
    });

    let finalPdfBuffer = basePdfBuffer;

    if (page2Scale !== null && Math.abs(page2Scale - scale) > 0.0001) {
      const page2PdfBuffer = await page.pdf({
        format: 'A4',
        landscape: false,
        scale: page2Scale,
        printBackground: true,
        preferCSSPageSize: false,
        margin: {
          top: `${marginTopMm}mm`,
          right: `${marginRightMm}mm`,
          bottom: `${marginBottomMm}mm`,
          left: `${marginLeftMm}mm`
        }
      });

      const baseDoc = await PDFDocument.load(basePdfBuffer);
      const page2Doc = await PDFDocument.load(page2PdfBuffer);
      const merged = await PDFDocument.create();

      const baseCount = baseDoc.getPageCount();
      const page2Count = page2Doc.getPageCount();

      if (baseCount > 0) {
        const first = await merged.copyPages(baseDoc, [0]);
        merged.addPage(first[0]);
      }

      if (baseCount > 1) {
        if (page2Count > 1) {
          const secondFromPage2 = await merged.copyPages(page2Doc, [1]);
          merged.addPage(secondFromPage2[0]);
        } else {
          const secondFromBase = await merged.copyPages(baseDoc, [1]);
          merged.addPage(secondFromBase[0]);
        }
      }

      if (baseCount > 2) {
        const remainingIndexes = Array.from({ length: baseCount - 2 }, (_, i) => i + 2);
        const remaining = await merged.copyPages(baseDoc, remainingIndexes);
        remaining.forEach((p) => merged.addPage(p));
      }

      finalPdfBuffer = Buffer.from(await merged.save());
    }

    if (args.output) {
      const fs = await import('node:fs/promises');
      await fs.writeFile(args.output, finalPdfBuffer);
    }

    if (!args.output) {
      process.stdout.write(finalPdfBuffer);
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exit(1);
});
