import { HebrewLetterGame } from "../components/HebrewLetterGame";
import { useTranscriber } from "../hooks/useTranscriber";

const CreateNote = () => {
    const transcriber = useTranscriber();

    return (
        <div>
            <HebrewLetterGame transcriber={transcriber} />
        </div>
    );
};

export default CreateNote;
