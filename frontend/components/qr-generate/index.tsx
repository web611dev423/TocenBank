import { QRCodeCanvas } from "qrcode.react";

const QRCodeGenerator = (props:any) => {
  
    const { value } = props;

    return (
    <div className="flex flex-col items-center">
      <QRCodeCanvas value={value} size={250} /> 
    </div>
  );
};

export default QRCodeGenerator;