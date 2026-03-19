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
      <div className="max-w-[1200px] mx-auto">
        <div className="mt-6 mb-4 border-l-[3px] border-[#C4A96A] pl-4">
          <p className="font-body text-[20px] text-warm-gray leading-relaxed m-0">
            {children}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SectionTransition;
