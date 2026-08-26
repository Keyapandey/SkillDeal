import "../css/studentScroller.css";

function StudentScroller() {

  const students = [
  {
    college: "VIT Vellore",
    year: "2nd Year CSE",
    rating: 5,
    reviews: 45,
    teaches: "Figma",
    wants: "SQL"
  },
  {
    college: "SRM Chennai",
    year: "3rd Year IT",
    rating: 4,
    reviews: 39,
    teaches: "Python",
    wants: "React"
  },
  {
    college: "MIT Manipal",
    year: "2nd Year CSE",
    rating: 3,
    reviews: 52,
    teaches: "DSA",
    wants: "DBMS"
  }
];
  return (
    <section className="student-section">

        <h2 className="student-heading">
  See Skill Exchanges Happening Right Now
</h2>

      <div className="scroll-track">

        {[...students, ...students].map((student, index) => (
          <div className="login-student-card" key={index}>

            <div className="profile-icon">
  👤
</div>

            <h3>Student at {student.college}</h3>

            <p>{student.year}</p>

           <p className="rating">
  {"★".repeat(student.rating)}
  {"☆".repeat(5 - student.rating)}
  {" "}
  ({student.reviews})
</p>
            <p>
              <strong>Teaches:</strong> {student.teaches}
            </p>

            <p>
              <strong>Wants:</strong> {student.wants}
            </p>

          </div>
        ))}

      </div>

    </section>
  );
}

export default StudentScroller;