function AppointmentSkeleton() {
    return (
        <div className="appointment-page">

            {/* HEADER */}
            <div className="page-header">
                <div className="sk sk-title"></div>
                <div className="sk sk-status"></div>
            </div>

            {/* INFO CARD */}
            <div className="card">
                <div className="info-header">

                    <div className="left">
                        <div className="sk sk-avatar"></div>

                        <div>
                            <div className="sk sk-name"></div>
                            <div className="sk sk-meta"></div>
                            <div className="sk sk-btn"></div>
                        </div>
                    </div>

                    <div className="right">
                        <div className="sk sk-btn"></div>
                    </div>

                </div>
            </div>

            {/* SERVICES */}
            <div className="card">
                <div className="sk sk-title"></div>

                {[1,2,3].map(i => (
                    <div key={i} className="service-row">
                        <div>
                            <div className="sk sk-service-name"></div>
                            <div className="sk sk-service-type"></div>
                        </div>

                        <div className="sk sk-icon"></div>
                    </div>
                ))}
            </div>

        </div>
    );
}

export default AppointmentSkeleton;