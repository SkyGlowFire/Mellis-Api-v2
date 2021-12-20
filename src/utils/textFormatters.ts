export function toUrlString(str: string = ''): string{
    return str.toLowerCase().replace(/\s/g, '_').replace(/&/g, 'and')
}

export function capitalize(str: string =''): string{
    return str && str.length > 0 
    ? str.split(' ').map(word => {
        return ['&', 'and'].includes(word)
            ? word
            : word[0].toUpperCase() + word.slice(1)
    }).join(' ')
    : ''
}

export function fromUrlString(str: string = ''): string{
    return str.length > 0 
    ? capitalize(str.replace(/_/g, ' ')).replace(/and/g, '&')
    : ''
}