
export interface Project {
    id: number;
    nome: string;
    slug: string;
    copertina: string;
    homepage: number;
}

export interface Media {
    id: number;
    nome: string;
    url: string;
    idProgetto: number; 
}