"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactElement,
} from "react";

import { Button } from "@/components/ui/button";

import { PrintDocumentFrame } from "./PrintDocumentFrame";

type PrintPaper = "a4" | "thermal";

function getPrintPageCss(paper: PrintPaper): string {
  if (paper === "thermal") {
    return `
      @page {
        size: 76mm auto;
        margin: 0;
      }

      html, body {
        width: 76mm;
        margin: 0;
        padding: 0;
      }
    `;
  }

  return `
    @page {
      size: A4 portrait;
      margin: 4mm;
    }

    html, body {
      margin: 0;
      padding: 0;
    }
  `;
}

export function PrintPreviewDialog({
  children,
  documentTitle,
  headerMode,
  paper = "a4",
  trigger,
}: {
  children: React.ReactNode;
  description?: string;
  documentTitle: string;
  headerMode?: "compact" | "full";
  paper?: PrintPaper;
  previewTitle?: string;
  trigger: React.ReactNode;
}): React.ReactElement {
  const [isPrinting, setIsPrinting] = useState(false);
  const printRootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isPrinting || !printRootRef.current) {
      return;
    }

    let cancelled = false;
    const iframe = document.createElement("iframe");

    iframe.setAttribute("aria-hidden", "true");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    document.body.appendChild(iframe);

    const cleanup = () => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
      setIsPrinting(false);
    };

    const run = async () => {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });

      if (cancelled || !printRootRef.current) {
        cleanup();
        return;
      }

      const iframeDocument = iframe.contentDocument;
      const iframeWindow = iframe.contentWindow;

      if (!iframeDocument || !iframeWindow) {
        cleanup();
        return;
      }

      iframeDocument.open();
      iframeDocument.write(`
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>${documentTitle}</title>
            <style>
              ${getPrintPageCss(paper)}

              * {
                box-sizing: border-box;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }

              body {
                background: #ffffff;
                color: #0f172a;
                font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              }

              [data-print-frame-outer],
              [data-print-frame-inner] {
                backdrop-filter: none !important;
                box-shadow: none !important;
              }
            </style>
          </head>
          <body>${printRootRef.current.innerHTML}</body>
        </html>
      `);
      iframeDocument.close();

      const finalize = () => {
        iframeWindow.removeEventListener("afterprint", finalize);
        cleanup();
      };

      iframeWindow.addEventListener("afterprint", finalize);

      setTimeout(() => {
        if (cancelled) {
          finalize();
          return;
        }

        iframeWindow.focus();
        iframeWindow.print();
      }, 120);
    };

    void run();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [documentTitle, isPrinting, paper]);

  const handleTriggerClick = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    if (!isPrinting) {
      setIsPrinting(true);
    }
  };

  let triggerNode: React.ReactNode;

  if (isValidElement(trigger)) {
    const element = trigger as ReactElement<{
      disabled?: boolean;
      onClick?: (event: MouseEvent<HTMLElement>) => void;
    }>;

    triggerNode = cloneElement(element, {
      disabled: isPrinting || element.props.disabled,
      onClick: (event: MouseEvent<HTMLElement>) => {
        element.props.onClick?.(event);
        if (!event.defaultPrevented) {
          handleTriggerClick(event);
        }
      },
    });
  } else {
    triggerNode = (
      <Button variant="outline" onClick={handleTriggerClick} disabled={isPrinting}>
        Print
      </Button>
    );
  }

  return (
    <>
      {triggerNode}
      <div
        aria-hidden="true"
        ref={printRootRef}
        style={{
          left: "-99999px",
          pointerEvents: "none",
          position: "fixed",
          top: "0",
          visibility: "hidden",
          width: paper === "thermal" ? "76mm" : "190mm",
          zIndex: -1,
        }}
      >
        <PrintDocumentFrame headerMode={headerMode} paper={paper} title={documentTitle}>
          {children}
        </PrintDocumentFrame>
      </div>
    </>
  );
}
