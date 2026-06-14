export default function SettingsSkeleton() {
    return (
        <div className="settings-page">

            {/* PROFILE CARD */}
            <div className="card settings-card skeleton">

                <div className="skeleton-title"></div>

                <div className="avatar-wrapper">
                    <div className="avatar-box">
                        <div className="skeleton-avatar"></div>
                    </div>
                </div>

                <div className="form-grid">
                    <div className="skeleton-input"></div>
                    <div className="skeleton-input"></div>
                    <div className="skeleton-input"></div>
                    <div className="skeleton-input"></div>
                    <div className="skeleton-input full"></div>
                </div>

                <div className="skeleton-button"></div>

            </div>

            {/* SECURITY CARD */}
            <div className="card settings-card skeleton">

                <div className="skeleton-title"></div>

                <div className="skeleton-block"></div>
                <div className="skeleton-block"></div>

            </div>

        </div>
    );
}