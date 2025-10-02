export function getWrappedLines(ctx, text, fontSize, maxTextWidth) {
    const prevFont = ctx.font;
    ctx.font = `${fontSize}px MyPC98Font, monospace`;
    const lines = text.split('\n');
    const wrappedLines = [];
    lines.forEach(line => {
        if (ctx.measureText(line).width <= maxTextWidth) {
            wrappedLines.push(line);
        } else {
            const words = line.split(' ');
            let currentLine = '';
            words.forEach(word => {
                const testLine = currentLine ? currentLine + ' ' + word : word;
                if (ctx.measureText(testLine).width <= maxTextWidth) {
                    currentLine = testLine;
                } else {
                    if (currentLine) wrappedLines.push(currentLine);
                    currentLine = word;
                }
            });
            if (currentLine) wrappedLines.push(currentLine);
        }
    });
    ctx.font = prevFont;
    return wrappedLines;
}