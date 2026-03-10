'use client';

export function DarkModeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              document.documentElement.classList.add('dark');
            } catch (e) {}
          })();
        `,
      }}
    />
  );
}
