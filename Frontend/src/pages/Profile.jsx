import {
  Settings,
  Globe,
  Link,
  User,
  X,
  Pencil,
  HelpCircle,
  Shield,
  LogOut,
  UserCog
} from "lucide-react";

import { getProfile, updateProfile } from "../api/profile";
import { getAllSkills, addSkill,deleteSkill } from "../api/skills";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "../components/DashboardNavbar";
import "../css/profile.css";


function Profile() {

  const navigate = useNavigate();

  const [showSettings, setShowSettings] = useState(false);
  const [showManageSkills, setShowManageSkills] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [originalTeachSkills, setOriginalTeachSkills] = useState([]);
  const [originalLearnSkills, setOriginalLearnSkills] = useState([]);

  const [profile, setProfile] = useState(null);

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    college: "",
    year: "",
    branch: "",
    about: "",
    linkedin: "",
    github: "",
    instagram: ""
  });


  /* ================================
     LOGOUT
  ================================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };


  /* ================================
     OPEN EDIT PROFILE
  ================================= */

  const handleEditProfile = () => {

    setEditForm({
      name: profile.name || "",
      email: profile.email || "",
      college: profile.college || "",
      year: profile.year || "",
      branch: profile.branch || "",
      about: profile.about || "",
      linkedin: profile.linkedin || "",
      github: profile.github || "",
      instagram: profile.instagram || ""
    });

    setShowEditProfile(true);
  };


  /* ================================
     EDIT FORM CHANGE
  ================================= */

  const handleEditChange = (e) => {

    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };


  /* ================================
     SAVE EDIT PROFILE
  ================================= */

  const handleSaveProfile = async (e) => {

    e.preventDefault();

    try {

      const data = await updateProfile({
        name: editForm.name,
        college: editForm.college,
        year: Number(editForm.year),
        branch: editForm.branch,
        about: editForm.about,
        linkedin: editForm.linkedin,
        github: editForm.github,
        instagram: editForm.instagram
      });

      setProfile((prev) => ({
        ...prev,
        ...data.profile
      }));

      setShowEditProfile(false);

      alert(data.message);

    } catch (error) {

      alert(error.message);

    }
  };


  /* ================================
     TEACH SKILLS
  ================================= */

  const handleTeachSkillChange = (e) => {

    const skill = e.target.value;

    if (!skill) return;

    if (!teachSkills.includes(skill)) {

      setTeachSkills((prev) => [
        ...prev,
        skill
      ]);

    }
  };


  /* ================================
     LEARN SKILLS
  ================================= */

  const handleLearnSkillChange = (e) => {

    const skill = e.target.value;

    if (!skill) return;

    if (!learnSkills.includes(skill)) {

      setLearnSkills((prev) => [
        ...prev,
        skill
      ]);

    }
  };


  /* ================================
     REMOVE TEACH SKILL
  ================================= */

  const removeTeachSkill = async (skillName) => {
  try {
    const skill = allSkills.find(
      (item) => item.name === skillName
    );

    if (!skill) return;

    await deleteSkill(skill.id, "TEACH");

    setTeachSkills((prev) =>
      prev.filter((item) => item !== skillName)
    );

    setProfile((prev) => ({
      ...prev,
      teachSkills: prev.teachSkills.filter(
        (item) => item.id !== skill.id
      )
    }));

  } catch (error) {
    alert(error.message);
  }
};


  /* ================================
     REMOVE LEARN SKILL
  ================================= */

  const removeLearnSkill = async (skillName) => {
  try {
    const skill = allSkills.find(
      (item) => item.name === skillName
    );

    if (!skill) return;

    await deleteSkill(skill.id, "LEARN");

    setLearnSkills((prev) =>
      prev.filter((item) => item !== skillName)
    );

    setProfile((prev) => ({
      ...prev,
      learnSkills: prev.learnSkills.filter(
        (item) => item.id !== skill.id
      )
    }));

  } catch (error) {
    alert(error.message);
  }
};

  /* ================================
     SAVE SKILLS
  ================================= */

  const handleSaveSkills = async () => {
  try {

    // NEW TEACH SKILLS
    const newTeachSkills = teachSkills.filter(
      (skill) => !originalTeachSkills.includes(skill)
    );

    // NEW LEARN SKILLS
    const newLearnSkills = learnSkills.filter(
      (skill) => !originalLearnSkills.includes(skill)
    );

    console.log("NEW TEACH SKILLS:", newTeachSkills);
console.log("ALL SKILLS:", allSkills);

    // Add new TEACH skills
    for (const skillName of newTeachSkills) {

      const skill = allSkills.find(
        (item) => item.name === skillName
      );
      
      console.log("SELECTED SKILL:", skillName, skill);

      if (skill) {
        await addSkill(skill.id, "TEACH");
      }
    }


    // Add new LEARN skills
    for (const skillName of newLearnSkills) {

      const skill = allSkills.find(
        (item) => item.name === skillName
      );

      if (skill) {
        await addSkill(skill.id, "LEARN");
      }
    }


    // Get fresh profile
    const data = await getProfile();

    setProfile(data.profile);

    const updatedTeachSkills =
      data.profile.teachSkills.map(
        (skill) => skill.name
      );

    const updatedLearnSkills =
      data.profile.learnSkills.map(
        (skill) => skill.name
      );

    setTeachSkills(updatedTeachSkills);
    setLearnSkills(updatedLearnSkills);

    setOriginalTeachSkills(updatedTeachSkills);
    setOriginalLearnSkills(updatedLearnSkills);

    setShowManageSkills(false);

    alert("Skills updated successfully!");

  } catch (error) {
    alert(error.message);
  }
};


  /* ================================
     FETCH PROFILE
  ================================= */

  useEffect(() => {

    const fetchProfile = async () => {

      try {

        const data = await getProfile();

        setProfile(data.profile);

        const teachSkillNames = data.profile.teachSkills.map(
  (skill) => skill.name
);

const learnSkillNames = data.profile.learnSkills.map(
  (skill) => skill.name
);

setTeachSkills(teachSkillNames);
setLearnSkills(learnSkillNames);

setOriginalTeachSkills(teachSkillNames);
setOriginalLearnSkills(learnSkillNames);

        const skillsData = await getAllSkills();

        setAllSkills(skillsData.skills);

      } catch (error) {

        console.error(
          "Failed to fetch profile:",
          error
        );

      }

    };

    fetchProfile();

  }, []);


  if (!profile) {
    return <div>Loading profile...</div>;
  }


  /* ================================
     YEAR SUFFIX
  ================================= */

  const getYearSuffix = (year) => {

    if (year === 1) return "st";
    if (year === 2) return "nd";
    if (year === 3) return "rd";

    return "th";
  };


  return (
    <>
      <DashboardNavbar />


      <section className="profile-page">

        <div className="profile-card">


          {/* =================================
              SETTINGS DRAWER
          ================================= */}

          {showSettings && (

            <div
              className="settings-overlay"
              onClick={() => setShowSettings(false)}
            >

              <div
                className="settings-drawer"
                onClick={(e) => e.stopPropagation()}
              >


                {/* =================================
                    NORMAL SETTINGS
                ================================= */}

                {!showManageSkills ? (

                  <>

                    <div className="settings-header">

                      <h2>Settings</h2>

                      <button
                        className="settings-close"
                        onClick={() =>
                          setShowSettings(false)
                        }
                      >
                        <X size={20} />
                      </button>

                    </div>


                    <div className="settings-menu">


                      {/* EDIT PROFILE */}

                      <button
                        className="settings-item"
                        onClick={handleEditProfile}
                      >

                        <Pencil size={20} />

                        <span>
                          Edit Profile
                        </span>

                      </button>


                      {/* MANAGE SKILLS */}

                      <button
                        className="settings-item"
                        onClick={() =>
                          setShowManageSkills(true)
                        }
                      >

                        <UserCog size={20} />

                        <span>
                          Manage Skills
                        </span>

                      </button>


                      {/* ACCOUNT SETTINGS */}

                      <button className="settings-item">

                        <UserCog size={20} />

                        <span>
                          Account Settings
                        </span>

                      </button>


                      {/* HELP */}

                      <button className="settings-item">

                        <HelpCircle size={20} />

                        <span>
                          Help & Support
                        </span>

                      </button>


                      {/* PRIVACY */}

                      <button className="settings-item">

                        <Shield size={20} />

                        <span>
                          Privacy & Security
                        </span>

                      </button>

                    </div>


                    <div className="settings-divider"></div>


                    {/* LOGOUT */}

                    <button
                      className="settings-item logout"
                      onClick={handleLogout}
                    >

                      <LogOut size={20} />

                      <span>
                        Logout
                      </span>

                    </button>

                  </>

                ) : (


                  /* =================================
                     MANAGE SKILLS
                  ================================= */

                  <>

                    <div className="settings-header">

                      <button
                        className="skills-back-btn"
                        onClick={() =>
                          setShowManageSkills(false)
                        }
                      >
                        ←
                      </button>


                      <h2>
                        Manage Skills
                      </h2>


                      <button
                        className="settings-close"
                        onClick={() =>
                          setShowSettings(false)
                        }
                      >

                        <X size={20} />

                      </button>

                    </div>


                    <div className="skills-manager">


                      {/* TEACH */}

                      <div className="skill-manager-section">

                        <label>
                          TEACH
                        </label>


                        <select
                          value=""
                          onChange={
                            handleTeachSkillChange
                          }
                        >

                          <option value="">
                            Select a skill...
                          </option>


                          {allSkills.map((skill) => (

                            <option
                              key={skill.id}
                              value={skill.name}
                            >
                              {skill.name}
                            </option>

                          ))}

                        </select>


                        <div className="selected-skills">

                          {teachSkills.map((skill) => (

                            <span
                              className="selected-skill teach-selected"
                              key={skill}
                            >

                              {skill}


                              <button
                                onClick={() =>
                                  removeTeachSkill(skill)
                                }
                              >
                                ×
                              </button>

                            </span>

                          ))}

                        </div>

                      </div>


                      {/* WANTS TO LEARN */}

                      <div className="skill-manager-section">

                        <label>
                          WANTS TO LEARN
                        </label>


                        <select
                          value=""
                          onChange={
                            handleLearnSkillChange
                          }
                        >

                          <option value="">
                            Select a skill...
                          </option>


                          {allSkills.map((skill) => (

                            <option
                              key={skill.id}
                              value={skill.name}
                            >
                              {skill.name}
                            </option>

                          ))}

                        </select>


                        <div className="selected-skills">

                          {learnSkills.map((skill) => (

                            <span
                              className="selected-skill learn-selected"
                              key={skill}
                            >

                              {skill}


                              <button
                                onClick={() =>
                                  removeLearnSkill(skill)
                                }
                              >
                                ×
                              </button>

                            </span>

                          ))}

                        </div>

                      </div>


                      {/* SAVE SKILLS */}

                      <button
                        className="save-skills-btn"
                        onClick={handleSaveSkills}
                      >
                        Save Skills
                      </button>

                    </div>

                  </>

                )}

              </div>

            </div>

          )}


          {/* =================================
              EDIT PROFILE MODAL
          ================================= */}

          {showEditProfile && (

            <div
              className="edit-profile-overlay"
              onClick={() =>
                setShowEditProfile(false)
              }
            >

              <div
                className="edit-profile-modal"
                onClick={(e) =>
                  e.stopPropagation()
                }
              >


                {/* MODAL HEADER */}

                <div className="edit-profile-header">

                  <h2>
                    Edit Profile
                  </h2>


                  <button
                    className="edit-profile-close"
                    onClick={() =>
                      setShowEditProfile(false)
                    }
                  >
                    <X size={20} />
                  </button>

                </div>


                {/* FORM */}

                <form
                  className="edit-profile-form"
                  onSubmit={handleSaveProfile}
                >


                  {/* NAME */}

                  <div className="edit-field">

                    <label>
                      Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      required
                    />

                  </div>


                  {/* EMAIL */}

                  <div className="edit-field">

                    <label>
                      Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      disabled
                    />

                    <small>
                      Email cannot be changed.
                    </small>

                  </div>


                  {/* COLLEGE */}

                  <div className="edit-field">

                    <label>
                      College
                    </label>

                    <input
                      type="text"
                      name="college"
                      value={editForm.college}
                      onChange={handleEditChange}
                      required
                    />

                  </div>


                  {/* YEAR */}

                  <div className="edit-field">

                    <label>
                      Year
                    </label>

                    <select
                      name="year"
                      value={editForm.year}
                      onChange={handleEditChange}
                      required
                    >

                      <option value="">
                        Select year
                      </option>

                      <option value="1">
                        1st Year
                      </option>

                      <option value="2">
                        2nd Year
                      </option>

                      <option value="3">
                        3rd Year
                      </option>

                      <option value="4">
                        4th Year
                      </option>

                    </select>

                  </div>


                  {/* BRANCH */}

                  <div className="edit-field">

                    <label>
                      Branch
                    </label>

                    <input
                      type="text"
                      name="branch"
                      value={editForm.branch}
                      onChange={handleEditChange}
                      required
                    />

                  </div>


                  {/* ABOUT */}

                  <div className="edit-field">

                    <label>
                      About
                    </label>

                    <textarea
                      name="about"
                      value={editForm.about}
                      onChange={handleEditChange}
                      rows="4"
                      placeholder="Tell others a little about yourself..."
                    />

                  </div>


                  {/* LINKEDIN */}

                  <div className="edit-field">

                    <label>
                      LinkedIn
                    </label>

                    <input
                      type="text"
                      name="linkedin"
                      value={editForm.linkedin}
                      onChange={handleEditChange}
                      placeholder="linkedin.com/in/yourname"
                    />

                  </div>


                  {/* GITHUB */}

                  <div className="edit-field">

                    <label>
                      GitHub
                    </label>

                    <input
                      type="text"
                      name="github"
                      value={editForm.github}
                      onChange={handleEditChange}
                      placeholder="github.com/yourusername"
                    />

                  </div>


                  {/* INSTAGRAM */}

                  <div className="edit-field">

                    <label>
                      Instagram
                    </label>

                    <input
                      type="text"
                      name="instagram"
                      value={editForm.instagram}
                      onChange={handleEditChange}
                      placeholder="@yourusername"
                    />

                  </div>


                  {/* SAVE */}

                  <button
                    type="submit"
                    className="save-profile-btn"
                  >
                    Save Changes
                  </button>

                </form>

              </div>

            </div>

          )}


          {/* =================================
              PROFILE HEADER
          ================================= */}

          <div className="profile-header">

            <div className="profile-top-row">

              <span className="profile-label">
                STUDENT PROFILE
              </span>


              <button
                className="settings-btn"
                onClick={() =>
                  setShowSettings(true)
                }
              >

                <Settings size={18} />

              </button>

            </div>


            <div className="profile-user">


              <div className="profile-avatar">

                {profile.name
                  .split(" ")
                  .map((name) => name[0])
                  .join("")
                  .toUpperCase()}

              </div>


              <div>

                <h1>
                  {profile.name}
                </h1>


                <p className="profile-meta">

                  {profile.college}
                  {" • "}
                  {profile.year}
                  {getYearSuffix(profile.year)}
                  {" Year • "}
                  {profile.branch}

                </p>

              </div>

            </div>

          </div>


          {/* =================================
              PROFILE BODY
          ================================= */}

          <div className="profile-body">


            {/* LEFT */}

            <div className="profile-left">


              {/* ABOUT */}

              <div className="profile-section">

                <h3>
                  ABOUT
                </h3>

                <p>
                  {profile.about ||
                    "No information added yet."}
                </p>

              </div>


              {/* TEACHES */}

              <div className="profile-section">

                <h3>
                  TEACHES
                </h3>


                <div className="tags-row">

                  {profile.teachSkills.map(
                    (skill) => (

                      <span
                        className="teach-tag"
                        key={skill.id}
                      >
                        {skill.name}
                      </span>

                    )
                  )}

                </div>

              </div>


              {/* WANTS TO LEARN */}

              <div className="profile-section">

                <h3>
                  WANTS TO LEARN
                </h3>


                <div className="tags-row">

                  {profile.learnSkills.map(
                    (skill) => (

                      <span
                        className="want-tag"
                        key={skill.id}
                      >
                        {skill.name}
                      </span>

                    )
                  )}

                </div>

              </div>

            </div>


            {/* RIGHT */}

            <div className="profile-right">


              {/* STATS */}

              <div className="stats-section">

                <h3 className="stats-title">
                  STATS
                </h3>


                <div className="stats-row">


                  <div>

                    <h2>
                      {profile.totalExchanges}
                    </h2>

                    <span>
                      EXCHANGES
                    </span>

                  </div>


                  <div>

                    <h2>
                      {
                        profile.teachSkills.length 
                      }
                    </h2>

                    <span>
                      SKILLS
                    </span>

                  </div>


                  <div>

                    <h2>
                      4.8
                    </h2>

                    <span>
                      RATING
                    </span>

                  </div>

                </div>

              </div>


              {/* SOCIALS */}

              <div className="social-section">

                <h3>
                  SOCIALS
                </h3>


                <div className="social-link">

                  <Link size={18} />

                  <span>
                    {profile.linkedin ||
                      "LinkedIn not added"}
                  </span>

                </div>


                <div className="social-link">

                  <Globe size={18} />

                  <span>
                    {profile.github ||
                      "GitHub not added"}
                  </span>

                </div>


                <div className="social-link">

                  <User size={18} />

                  <span>
                    {profile.instagram ||
                      "Instagram not added"}
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>
    </>
  );
}

export default Profile;