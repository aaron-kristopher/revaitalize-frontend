import React from 'react';

export const TermsAndCondition: React.FC = () => {
    return (
        <>
            <div className="pb-4 space-y-2 border-b">
                <h1 className="text-3xl font-bold tracking-tighter">RevAItalize - Terms and Condition</h1>
                <p className="text-muted-foreground">Effective Date: July 2024</p>
            </div>

            <p className="pt-4">
                Welcome to RevAItalize! This application is a thesis project designed to assist users in their post-rehabilitation
                journey for low-back pain by providing an AI-powered assessment of their exercises.
            </p>
            <p>
                By creating an account and using RevAItalize, you agree to the following terms and conditions:
            </p>

            <h2 className="pt-6 font-semibold">1. Purpose of the Application</h2>
            <p>
                RevAItalize utilizes a Long Short-Term Memory (LSTM) model to classify the correctness of three specific
                post-rehabilitation exercises: Hiding Face, Torso Rotation, and Flank Stretch. The system provides real-time
                feedback based on skeletal keypoint analysis derived from your device's camera via BlazePose.
            </p>
            <p className="text-destructive text-sm pt-2">
                <span className="font-semibold">Disclaimer:</span> RevAItalize is intended as an assistive tool and is NOT
                a replacement for professional medical advice, diagnosis, or treatment from a qualified physical therapist
                or healthcare provider. Always seek the advice of your physician or other qualified health provider with any
                questions you may have regarding a medical condition or rehabilitation program.
            </p >

            <h2 className="pt-6 font-semibold">2. Data Collection and Usage</h2>
            <p>
                To use RevAItalize, you will be asked to provide personal information during account creation including your
                name, email, age, and address. This information is collected to create and manage your user account and allow for progress tracking.
            </p>
            <p className="pt-4">
                <span className="font-semibold">Video Data:</span> During exercise performance, the application will access
                your device's camera. This video data is processed in real-time to extract skeletal landmarks.
                <span className="font-semibold">Raw video data is NOT saved or stored by the application or on any server
                    after processing is complete.</span> Only the derived skeletal keypoint data and performance metrics are used by the model.
            </p>
            <p className="pt-4">
                <span className="font-semibold">Data Privacy and Security:</span> We are committed to protecting your privacy.
                Any personal information you provide will be handled securely.
            </p>

            <h2 className="pt-6 font-semibold">3. User Responsibilities</h2>
            <ul>
                <li>You are responsible for ensuring that you are physically able to perform the exercises. Consult your physical
                    therapist or doctor before starting.</li>
                <li>Perform exercises in a safe environment with adequate space to avoid injury.</li>
                <li>The feedback provided by RevAItalize is based on an AI model and may not be 100% accurate. If you feel pain,
                    stop the exercise immediately and consult a professional.</li>
                <li>You are responsible for maintaining the confidentiality of your account password.</li>
            </ul>

            <h2 className="pt-6 font-semibold">4. System Performance and Limitations</h2>
            <p>
                The accuracy of RevAItalize is subject to the limitations of the AI model, video quality, camera angle, and lighting
                conditions. The model may occasionally misclassify movements. These limitations are acknowledged, and ongoing
                research aims to improve accuracy.
            </p>

            <h2 className="pt-6 font-semibold">5. Intellectual Property</h2>
            <p>
                The RevAItalize application, its design, and the underlying AI models are the intellectual property of the
                developers for academic purposes.
            </p>

            <h2 className="pt-6 font-semibold">6. Modification of Terms</h2>
            <p>
                We reserve the right to modify these terms at any time. Your continued use of the application after such
                modifications constitutes your acceptance of the new terms.
            </p>

            <h2 className="pt-6 font-semibold">7. Contact</h2>
            <p>
                If you have any questions about these Terms of Service, please contact us at revaitalize@gmail.com.
            </p>

            <p className="font-bold mt-4">
                By checking "I agree to the Terms & Conditions" and creating an account, you acknowledge that you have read,
                understood, and agree to be bound by these Terms of Service.
            </p>
        </>
    );
};
