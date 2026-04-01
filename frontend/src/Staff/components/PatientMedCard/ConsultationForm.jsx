// import { useState } from "react";
// import API from "../../api";
//
// export default function ConsultationForm({ service }) {
//     const [form, setForm] = useState({
//         diagnosis: "",
//         treatment: "",
//         notes: ""
//     });
//
//     const save = async () => {
//         await API.post(
//             `/doctor/appointment-service/${service.id}/medical-record`,
//             form
//         );
//
//         alert("Збережено");
//     };
//
//     return (
//         <div>
//             <h5>Медична карта</h5>
//
//             <input
//                 placeholder="Діагноз"
//                 onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
//             />
//
//             <input
//                 placeholder="Лікування"
//                 onChange={(e) => setForm({ ...form, treatment: e.target.value })}
//             />
//
//             <textarea
//                 placeholder="Примітки"
//                 onChange={(e) => setForm({ ...form, notes: e.target.value })}
//             />
//
//             <button onClick={save}>Зберегти</button>
//         </div>
//     );
// }