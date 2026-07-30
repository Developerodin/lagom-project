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
            <td>{signup.name}</td>
            <td>{signup.email}</td>
            <td>{signup.phone}</td>
            <td>{signup.createdAt}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
