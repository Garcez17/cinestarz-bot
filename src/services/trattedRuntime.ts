export function trattedRuntime(runtime: string) {
    const total = Number(runtime.split(' ')[0]);

    const hours = Math.floor(total / 60);
    const minutes = total % 60;

    return (hours > 0 && minutes > 0) ? 
        `${hours}h${minutes}m` : 
        (hours > 0 && minutes < 0) ?
        `${hours}h` :
        (hours < 0 && minutes > 0) ?
        `${minutes}m` :
        `erro`;
}