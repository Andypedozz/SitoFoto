import Panel from "../common/Panel";
import { useProgetti } from "./useProgetti";
import ProgettiFooter from "./ProgettiFooter";
import ProgettiForm from "./ProgettiForm";
import ProgettiHeader from "./ProgettiHeader";
import { ProgettiError, ProgettiLoader } from "./ProgettiStates";
import ProgettiTable from "./ProgettiTable";

// GestioneProgetti.jsx
export default function GestioneProgetti() {
    const {
        // Stati
        progetti,
        isLoading,
        error,
        showForm,
        editingProject,
        formData,
        
        // Handlers
        handleInputChange,
        handleSubmit,
        handleEdit,
        handleDelete,
        handleDuplicate,
        resetForm,
        fetchProgetti
    } = useProgetti();

    // Stati di caricamento/errore
    if (isLoading) return <ProgettiLoader />;
    if (error) return <ProgettiError error={error} onRetry={fetchProgetti} />;

    return (
        <Panel>
            <ProgettiHeader 
                totalCount={progetti.length}
                showForm={showForm}
                onToggleForm={resetForm}
            />

            <ProgettiTable 
                progetti={progetti}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
            />

            <ProgettiForm 
                show={showForm}
                editingProject={editingProject}
                formData={formData}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                onClose={resetForm}
            />

            <ProgettiFooter 
                totalCount={progetti.length}
                isLoading={isLoading}
            />
        </Panel>
    );
}