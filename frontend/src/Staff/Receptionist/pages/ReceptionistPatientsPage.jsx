import { useEffect, useState } from "react";
import API from "../../../api";

import ReceptionistPatientsList from "../components/Patient/ReceptionistPatientsList";
import ReceptionistPatientsSkeleton from "../components/Skeleton/Patient/ReceptionistPatientsSkeleton";

import styles from "../styles/ReceptionistPatientsPage.module.scss";

export default function ReceptionistPatientsPage() {

    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        API.get("/receptionist/view/patients")
            .then(res => {
                setPatients(res.data || []);
            })
            .catch(err => {
                console.log(err);
            })
            .finally(() => {
                setLoading(false);
            });

    }, []);

    return (
        <div className={styles.page}>

            <div className={styles.header}>
                <h2>Пацієнти</h2>
                <p>Список всіх пацієнтів клініки</p>
            </div>

            {loading ? (
                <ReceptionistPatientsSkeleton />
            ) : (
                <ReceptionistPatientsList
                    patients={patients}
                    setPatients={setPatients}

                />
            )}

        </div>
    );
}