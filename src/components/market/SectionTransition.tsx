interface SectionTransitionProps {
  children: React.ReactNode;
}

const SectionTransition = ({ children }: SectionTransitionProps) => {
  if (!children) return null;

  return (
    <div
      style={{
        marginLeft: "calc(-50vw + 50%)",
        marginRight: "calc(-50vw + 50%)",
        paddingLeft: "calc(50vw - 50%)",
        paddingRight: "calc(50vw - 50%)",
      }}
    >
      <div className="max-w-[700px] mx-auto mt-6 mb-4">
        <p className="font-body text-[15px] text-warm-gray leading-relaxed m-0">
          {children}
        </p>
      </div>
    </div>
  );
};

export default SectionTransition;
