export default function LabsResults({ labs }) {
    if (!labs.length) return <p>Лабораторних аналізів немає</p>;

    return (
        <div className="labs-results">
            <h2>Лабораторні аналізи</h2>
            {labs.map((lab) => (
                <div key={lab.id} className="lab">
                    <p><strong>Назва аналізу:</strong> {lab.lab_name || `ID: ${lab.id}`}</p>
                    {lab.labs_files?.map((file) => (
                        <a key={file.id} href={file.file_path} target="_blank" rel="noopener noreferrer">
                            Завантажити файл ({file.file_type})
                        </a>
                    ))}
                    <hr />
                </div>
            ))}
        </div>
    );
}