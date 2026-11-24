import PageBand from "../components/PageBand";
import { ChatBubbleIcon, EditNoteIcon, SearchIcon } from "../components/Icons";
import "./About.css";

const STEPS = [
  {
    title: "Browse & Filter",
    text: "Search by item name or filter by Lost/Found status, category, campus building, and date.",
    icon: <SearchIcon />,
    tone: "ab-tone-papaya",
  },
  {
    title: "Open to Contact",
    text: "Open any report card to read the full description and see the finder’s or owner’s preferred contact handle.",
    icon: <ChatBubbleIcon />,
    tone: "ab-tone-sage",
  },
  {
    title: "Post in Seconds",
    text: "No login or account needed. Submit a report directly with a photo link or automatic category illustration.",
    icon: <EditNoteIcon />,
    tone: "ab-tone-beige",
  },
];

const CONTRIBUTORS = [
  {
    name: "Hanif Ilham Athaurrahman",
    role: "Backend Developer",
    github: "https://github.com/athaurian",
  },
  {
    name: "Salva Faddil Rinaldi",
    role: "Frontend Developer",
    github: "https://github.com/salvafaddil",
  },
  {
    name: "Ilham Ligar Samudra",
    role: "Frontend Developer",
    github: "https://github.com/Ilham12359",
  },
];

export default function About() {
  return (
    <>
      <PageBand
        title="About 404 Found"
        subtitle="Private, Easy-to-Use Lost & Found Board for the Civitas Academica of CSUI"
        icon={<ChatBubbleIcon />}
      />

      <main className="ab-main">
        <div className="container ab-inner">
          <section className="ab-grid" aria-label="How 404 Found works">
            {STEPS.map((step) => (
              <article className="ab-card ab-step" key={step.title}>
                <span className={`ab-step-icon ${step.tone}`} aria-hidden="true">
                  {step.icon}
                </span>
                <h2 className="ab-card-title">{step.title}</h2>
                <p className="ab-step-text">{step.text}</p>
              </article>
            ))}
          </section>

          <section className="ab-contributors" aria-label="Contributors">
            <h2 className="ab-heading">Contributors</h2>
            <div className="ab-grid">
              {CONTRIBUTORS.map((person) => (
                <article className="ab-card" key={person.name}>
                  <div className="ab-person">
                    <h3 className="ab-card-title">{person.name}</h3>
                    <p className="ab-role">{person.role}</p>
                  </div>
                  <div className="ab-card-footer">
                    <a
                      className="ab-link"
                      href={person.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>GitHub Profile</span>
                      <span className="ab-sr">
                        {" "}
                        of {person.name} (opens in a new tab)
                      </span>
                      <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
