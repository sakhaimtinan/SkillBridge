
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  BriefcaseBusiness,
  GraduationCap,
  CheckCircle2,
  Target,
  Users,
  ShieldCheck
} from "lucide-react";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">
              <Sparkles size={15} /> Platform Kolaborasi Digital
            </span>

            <h1>
              Your Skills.
              <br />
              Real Opportunities.
              <br />
              <span className="gradient-text">Better Together.</span>
            </h1>

            <p className="hero-description">
              SkillBridge menghubungkan mahasiswa berbakat dengan
              UMKM yang membutuhkan solusi digital. Bangun
              pengalaman nyata, kembangkan bisnis, dan tumbuh
              bersama melalui proyek kolaborasi.
            </p>

            <div className="button-row">
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started <ArrowRight size={18} />
              </Link>
              <Link to="/projects" className="btn btn-outline btn-lg">
                Explore Projects
              </Link>
            </div>

            <div className="hero-points">
              <span><CheckCircle2 size={17} /> Proyek nyata</span>
              <span><CheckCircle2 size={17} /> Kolaborasi terstruktur</span>
              <span><CheckCircle2 size={17} /> Portofolio digital</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="floating-label top-label">
              <span className="mini-icon blue"><GraduationCap /></span>
              Student Talent
            </div>

            <div className="hero-main-card">
              <div className="illustration-icon"><Users size={48} /></div>
              <h3>Collaboration That Creates Impact</h3>
              <p>
                Dari ide menjadi solusi. Dari keterampilan
                menjadi pengalaman nyata.
              </p>

              <div className="visual-steps">
                <div><span>01</span> Discover</div>
                <div><span>02</span> Connect</div>
                <div><span>03</span> Collaborate</div>
              </div>
            </div>

            <div className="floating-label bottom-label">
              <span className="mini-icon purple"><BriefcaseBusiness /></span>
              UMKM Projects
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">WHO IS SKILLBRIDGE FOR?</span>
            <h2>One Platform, Two Opportunities</h2>
            <p>Dua kebutuhan berbeda, satu ruang kolaborasi.</p>
          </div>

          <div className="grid-2">
            <div className="role-card student-card">
              <div className="role-icon"><GraduationCap size={30} /></div>
              <span className="role-tag">FOR STUDENTS</span>
              <h3>Turn Your Skills into Experience</h3>
              <p>
                Temukan proyek dari UMKM, terapkan keterampilanmu,
                dan bangun portofolio dari pengalaman kerja nyata.
              </p>
              <Link to="/register" className="text-link">
                Join as Student <ArrowRight size={17} />
              </Link>
            </div>

            <div className="role-card business-card">
              <div className="role-icon"><BriefcaseBusiness size={30} /></div>
              <span className="role-tag">FOR UMKM</span>
              <h3>Grow Your Business with Digital Talent</h3>
              <p>
                Publikasikan kebutuhan digital usahamu dan temukan
                mahasiswa dengan kompetensi yang relevan.
              </p>
              <Link to="/register" className="text-link">
                Join as UMKM <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section light-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">HOW IT WORKS</span>
            <h2>Simple Steps, Meaningful Impact</h2>
          </div>

          <div className="grid-3">
            {[
              {
                icon: <Target />,
                number: "01",
                title: "Discover",
                text: "UMKM membagikan kebutuhan proyek dan mahasiswa menemukan peluang sesuai keahlian."
              },
              {
                icon: <Users />,
                number: "02",
                title: "Connect",
                text: "Mahasiswa mengajukan lamaran dan UMKM memilih kandidat."
              },
              {
                icon: <ShieldCheck />,
                number: "03",
                title: "Collaborate",
                text: "Kedua pihak bekerja melalui workspace dengan tugas dan komunikasi."
              }
            ].map((item) => (
              <div className="feature-card" key={item.number}>
                <span className="step-number">{item.number}</span>
                <div className="feature-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-inner">
          <h2>Ready to Build Something Great?</h2>
          <p>Mulai perjalanan kolaborasimu bersama SkillBridge.</p>
          <Link to="/register" className="btn btn-white btn-lg">
            Join SkillBridge <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
