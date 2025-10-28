<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
<meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
<title>test</title>
</head>

<body>

<form id="form1" runat="server">
	<asp:CreateUserWizard id="CreateUserWizard1" runat="server">
		<WizardSteps>
			<asp:CreateUserWizardStep runat="server" />
			<asp:CompleteWizardStep runat="server" />
		</WizardSteps>
	</asp:CreateUserWizard>
</form>

</body>

</html>
