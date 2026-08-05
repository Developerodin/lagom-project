type SignupRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
};

export function StationaryLaunchSignupList({
  signups,
}: {
  signups: SignupRow[];
}) {
  if (signups.length === 0) {
    return <div className="admin-empty">No launch signups yet.</div>;
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Signed up</th>
          </tr>
        </thead>
        <tbody>
          {signups.map((signup) => (
            <tr key={signup.id}>
              <td data-label="Name">{signup.name}</td>
              <td data-label="Email">{signup.email}</td>
              <td data-label="Phone">{signup.phone}</td>
              <td data-label="Signed up">{signup.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
