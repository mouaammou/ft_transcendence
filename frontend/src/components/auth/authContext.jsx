export default function LoginPage() {
	return (
		<div className="login">
			<form onSubmit={handleSubmit}>
				<div className="form-group">
					<label htmlFor="username">Username</label>
					<input
						type="text"
						className="form-control"
						name="username"
						onChange={handleChange}
					/>
				</div>
				<div className="form-group">
					<label htmlFor="password">Password</label>
					<input
						type="password"
						className="form-control"
						name="password"
						onChange={handleChange}
					/>
				</div>
				<button type="submit" className="btn btn-primary">
					Login
				</button>
				<br />
				{
					<p className="text-danger">
						{!(errors.success ? errors.success : errors.error)
							? errors.sever_error
							: errors.success
							? errors.success
							: errors.error}
					</p>
				}
			</form>
		</div>
	);
}
