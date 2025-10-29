import ImportButton from "../components/ImportButton";
import ExportButton from "../components/ExportButton";
import ResetButton from "../components/ResetButton";
import SectionLauncher from "../components/SectionLauncher";
import Summary from "../sections/Summary";

export default function EditorPage() {
  return (
    <div className="app-container">
      <div className="app-header">
        <div className="button-group">
          <ImportButton />
          <ExportButton />
        </div>
        <div className="button-group">
          <ResetButton />
        </div>
      </div>
      
      <div className="row g-2">
        <div className="col-12">
          <div className="mb-3">
          </div>
        </div>
        <div className="col-lg-7 left-column">
          <SectionLauncher />
        </div>
        <div className="col-lg-5 summary-column">
          <Summary />
        </div>
      </div>
      
    </div>
  );
}
