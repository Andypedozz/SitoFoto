// components/ProgettiForm.jsx

import FormGroup from "../common/FormGroup";

const FORM_FIELDS = (formData, handleInputChange, editingProject) => [
    {
        id: 'nome',
        name: 'nome',
        label: 'Nome Progetto',
        type: 'input',
        inputType: 'text',
        placeholder: 'Inserisci il nome del progetto',
        value: formData.nome,
        onChange: handleInputChange,
        required: true,
        description: 'Il nome del progetto sarà usato per identificarlo'
    },
    {
        id: 'slug',
        name: 'slug',
        label: 'Slug',
        type: 'input',
        inputType: 'text',
        placeholder: 'slug-del-progetto',
        value: formData.slug,
        onChange: handleInputChange,
        required: true,
        description: 'Identificatore unico per URL (generato automaticamente)'
    },
    {
        id: 'copertina',
        name: 'copertina',
        label: 'Copertina',
        type: 'input',
        inputType: 'text',
        placeholder: 'nome-file.jpg',
        value: formData.copertina,
        onChange: handleInputChange,
        description: 'Nome del file dell\'immagine di copertina'
    }
];

export default function ProgettiForm({ 
    show, 
    editingProject, 
    formData, 
    onInputChange, 
    onSubmit,
    onClose 
}) {
    if (!show) return null;

    return (
        <div className="mt-8 border-t border-red-900/30 pt-8">
            <FormGroup
                title={editingProject ? '✎ Modifica Progetto' : '➕ Nuovo Progetto'}
                fields={FORM_FIELDS(formData, onInputChange, editingProject)}
                onSubmit={onSubmit}
                submitLabel={editingProject ? 'Aggiorna Progetto' : 'Crea Progetto'}
                variant="default"
            />
        </div>
    );
}