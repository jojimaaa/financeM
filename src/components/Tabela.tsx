
export function Tabela(props) {
  if (props.data) {
    console.log(props.data);
    return (
      <div>
        <h1 className="text-7xl">Sophia Linda</h1>
        {props.data.map((item, index) => {
          return <div key={index}>{item.id_fluxo}</div>;
        })}
      </div>
    );
  } else {
    console.log(props.data);
    return <div>Loading...</div>;
  }
}
