export const parseInput = (string) => {
    if (!string) return 0

    if (typeof string === 'number') return parseInt(string) || 0

    if (string.includes(':')) {
        const [minutes, seconds] = string.split(':').map(Number)
        return (minutes * 60) + seconds
    } else {
        return parseInt(string) || 0
    }
}