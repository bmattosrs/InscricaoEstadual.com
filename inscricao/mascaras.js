export function maskRS(inscricaoInput){
    var result = inscricao.replace(/([0-9]{3})([0-9]{7})/,"$1/$2");
    return result
}