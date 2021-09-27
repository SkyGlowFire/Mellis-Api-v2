export function toUrlString(str: string = ''): string{
    return str.toLowerCase().replace(/\s/g, '_').replace(/&/g, 'and')
}

export function capitalize(str: string =''): string{
    return str.length > 0 
    ? str[0].toUpperCase() + str.slice(1)
    : ''
}

export function fromUrlString(str: string = ''): string{
    return str.length > 0 
    ? capitalize(str.replace(/_/g, ' ')).replace(/and/g, '&')
    : ''
}