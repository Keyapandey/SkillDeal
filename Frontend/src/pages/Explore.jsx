import DashboardNavbar from "../components/DashboardNavbar";
import "../css/explore.css";
import { UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import AuthPrompt from "../components/AuthPrompt";
import Loading from "../components/loading";

import {
  getAllSkills,
  searchUsersBySkill,
  getAllUsers
} from "../api/skills";

import { sendExchangeRequest } from "../api/exchange";


function Explore() {
  const navigate = useNavigate(); 

  const [skills, setSkills] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [students, setStudents] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [clickedSkill, setClickedSkill] = useState(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {

    const fetchData = async () => {

      try {

        const skillData = await getAllSkills();
        const userData = await getAllUsers();

        setSkills(skillData.skills);
        setStudents(userData.users);

      } catch (error) {

        console.error(
          "Failed to fetch explore data:",
          error
        );
        } finally {

      setIsLoading(false);
      }

    };

    fetchData();

  }, []);


  const handleSearch = async () => {

    const query = searchText.trim();


    if (!query) {

      const data = await getAllUsers();

      setStudents(data.users);

      return;
    }


    const matchedSkill = skills.find(
      (skill) =>
        skill.name.toLowerCase() === query.toLowerCase()
    );


    if (!matchedSkill) {

      setStudents([]);

      alert("Skill not found");

      return;
    }


    try {

      const data =
        await searchUsersBySkill(matchedSkill.id);

      setStudents(data.users);

    } catch (error) {

      console.error(
        "Failed to search users:",
        error
      );

    }

  };


  const handleTrendingClick = async (skillName) => {

    setClickedSkill(skillName);

    setSearchText(skillName);


    const matchedSkill = skills.find(
      (skill) =>
        skill.name.toLowerCase() ===
        skillName.toLowerCase()
    );


    if (!matchedSkill) {

      setStudents([]);

      return;
    }


    try {

      const data =
        await searchUsersBySkill(matchedSkill.id);

      setStudents(data.users);

    } catch (error) {

      console.error(
        "Failed to search trending skill:",
        error
      );

    }


    setTimeout(() => {

      setClickedSkill(null);

    }, 400);

  };


  const handleRequestExchange = async (receiverId) => {

  const token = localStorage.getItem("token");

  if (!token) {
    setShowAuthPrompt(true);
    return;
  }

  try {
    const data = await sendExchangeRequest(receiverId);

    alert(data.message);
  } catch (error) {
    alert(error.message);
  }

};

  return (
<>

    {isLoading ? (
      <Loading />
    ) : (
      <>

      <DashboardNavbar />


      <section className="explore-page">


        {/* =========================
            EXPLORE HERO / SEARCH
        ========================= */}

        <div className="explore-hero">

          <div className="search-section">

            <input
              type="text"
              placeholder="Search skills..."
              className="search-bar"
              value={searchText}
              onChange={(e) =>
                setSearchText(e.target.value)
              }
            />


            <button
              className="filter-btn"
              onClick={handleSearch}
            >
              Search
            </button>

          </div>

        </div>



        {/* =========================
            TRENDING SKILLS
        ========================= */}

        <div className="trending-section">

          <div className="skills-heading">

            <h2>
              Trending Skills
            </h2>

            <div className="skills-heading-line"></div>

          </div>


          <div className="skills-container">


            <button
              className={`skill-chip skill-rust ${
                clickedSkill === "Figma"
                  ? "clicked"
                  : ""
              }`}
              onClick={() =>
                handleTrendingClick("Figma")
              }
            >
              Figma
            </button>


            <button
              className={`skill-chip skill-olive ${
                clickedSkill === "Canva"
                  ? "clicked"
                  : ""
              }`}
              onClick={() =>
                handleTrendingClick("Canva")
              }
            >
              Canva
            </button>


            <button
              className={`skill-chip skill-blue ${
                clickedSkill === "Animation"
                  ? "clicked"
                  : ""
              }`}
              onClick={() =>
                handleTrendingClick("Animation")
              }
            >
              Animation
            </button>


            <button
              className={`skill-chip skill-brown ${
                clickedSkill === "Chess"
                  ? "clicked"
                  : ""
              }`}
              onClick={() =>
                handleTrendingClick("Chess")
              }
            >
              Chess
            </button>


            <button
              className={`skill-chip skill-rust ${
                clickedSkill === "Public Speaking"
                  ? "clicked"
                  : ""
              }`}
              onClick={() =>
                handleTrendingClick("Public Speaking")
              }
            >
              Public Speaking
            </button>


            <button
              className={`skill-chip skill-olive ${
                clickedSkill === "Excel"
                  ? "clicked"
                  : ""
              }`}
              onClick={() =>
                handleTrendingClick("Excel")
              }
            >
              Excel
            </button>


            <button
              className={`skill-chip skill-blue ${
                clickedSkill === "Python"
                  ? "clicked"
                  : ""
              }`}
              onClick={() =>
                handleTrendingClick("Python")
              }
            >
              Python
            </button>


            <button
              className={`skill-chip skill-brown ${
                clickedSkill === "Video Editing"
                  ? "clicked"
                  : ""
              }`}
              onClick={() =>
                handleTrendingClick("Video Editing")
              }
            >
              Video Editing
            </button>


            <button
              className={`skill-chip skill-rust ${
                clickedSkill === "C++"
                  ? "clicked"
                  : ""
              }`}
              onClick={() =>
                handleTrendingClick("C++")
              }
            >
              C++
            </button>


            <button
              className={`skill-chip skill-olive ${
                clickedSkill === "WordPress"
                  ? "clicked"
                  : ""
              }`}
              onClick={() =>
                handleTrendingClick("WordPress")
              }
            >
              WordPress
            </button>

          </div>

        </div>



        {/* =========================
            STUDENT RESULTS
        ========================= */}

        <div className="students-grid">

          {students.map((student) => (

            <div
              className="student-card"
              key={student.id}
            >

              <div className="student-header">

                <UserCircle
                  className="student-avatar"
                  onClick={() =>
                    setShowProfile(true)
                  }
                />

                <div>

                  <h3>
                    {student.name}
                  </h3>

                  <span className="student-meta">
                    {student.college} •{" "}
                    {student.year} Year
                  </span>

                </div>

              </div>


              <p>

                <strong>
                  Teaches:
                </strong>{" "}

                {student.skills
                  .filter(
                    (item) =>
                      item.type === "TEACH"
                  )
                  .map(
                    (item) =>
                      item.skill.name
                  )
                  .join(", ")}

              </p>


              <p>

                <strong>
                  Wants:
                </strong>{" "}

                {student.skills
                  .filter(
                    (item) =>
                      item.type === "LEARN"
                  )
                  .map(
                    (item) =>
                      item.skill.name
                  )
                  .join(", ")}

              </p>


              <button
                onClick={() =>
                  handleRequestExchange(
                    student.id
                  )
                }
              >
                Request Exchange
              </button>

            </div>

          ))}

        </div>



        {/* =========================
            PROFILE MODAL
        ========================= */}

        {showProfile && (

          <div
            className="profile-overlay"
            onClick={() =>
              setShowProfile(false)
            }
          >

            <div
              className="profile-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <h2>
                User Profile
              </h2>

              <p>
                Profile content coming soon...
              </p>

              <button
                onClick={() =>
                  setShowProfile(false)
                }
              >
                Close
              </button>

            </div>

          </div>

        )}
               {/* with this: */}
        {showAuthPrompt && (
          <AuthPrompt
            onClose={() => setShowAuthPrompt(false)}
            onGetStarted={() => {
              setShowAuthPrompt(false);
              navigate("/", { state: { openSignup: true } });
            }}
            onLogin={() => {
              setShowAuthPrompt(false);
              navigate("/", { state: { openLogin: true } });
            }}
          />
        )}

      </section>
</>
    )}
  </>
  );

}
export default Explore;