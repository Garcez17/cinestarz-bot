export function verfiyIndicationFormat(indication: string, code: number) {
  const hasHypen = indication?.includes(' - ');

  if (!code) return true;

  if ((code === 1) || (code === 4) || (code === 5) || (code === 7) || (code === 8) || (code === 9)) {
    if (hasHypen) {
      return false;
    } 
    
    return true;
  } else {
    if (hasHypen) return true;

    return false;
  }
}