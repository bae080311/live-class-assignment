'use client'

import { useEnrollmentForm } from '@/lib/hooks/useEnrollmentForm'
import { Button } from './Button'
import { TopBar } from './TopBar'
import { StepBar } from './StepBar'
import { Step1CourseSelect } from './Step1CourseSelect'
import { Step2StudentInfo } from './Step2StudentInfo'
import { Step3Confirm } from './Step3Confirm'
import { ResultSuccess } from './ResultSuccess'
import { ResultFail } from './ResultFail'
import { SaveBanner, RecoverBanner } from './SaveBanner'
import { LeaveModal } from './LeaveModal'

export function EnrollmentForm() {
  const {
    step, isResult, numericStep,
    localState, mergedState, set,
    showCourseError, agreedError, participantErrors, saveState,
    enrollmentId, submitError,
    showLeaveModal, setShowLeaveModal,
    courses, coursesLoading,
    register, errors, watchedRHF,
    isPending,
    hasDraft, persistenceAvailable, dismiss,
    handleNext, handleBack, handleReset, handleRecover, handleJumpTo,
  } = useEnrollmentForm()

  return (
    <div className="min-h-screen bg-white flex justify-center">
      {step === 1 && hasDraft && (
        <RecoverBanner onRecover={handleRecover} onDismiss={dismiss} />
      )}
      <div className="w-full max-w-[600px] min-h-screen bg-white flex flex-col">
        <div className="flex-1 overflow-y-auto relative">
          <div className="flex flex-col min-h-full">
            {!isResult && (
              <>
                <TopBar step={numericStep} totalSteps={3} onBack={handleBack} />
                <StepBar step={numericStep} />
              </>
            )}

            <div className="flex flex-col gap-5 px-5 py-6 flex-1 pb-36">
              {typeof step === 'number' && step >= 2 && !isResult && (
                <SaveBanner state={saveState} />
              )}

              {typeof step === 'number' && !persistenceAvailable && !isResult && (
                <div className="text-xs text-ink-3 px-4 py-2.5 bg-ink-5/60 rounded-lg border border-ink-5">
                  자동 저장을 사용할 수 없어요. 완료 전 창을 닫으면 내용이 사라져요.
                </div>
              )}

              {step === 1 && (
                <Step1CourseSelect
                  state={localState}
                  set={set}
                  showError={showCourseError}
                  courses={courses}
                  isLoading={coursesLoading}
                />
              )}

              {step === 2 && (
                <Step2StudentInfo
                  state={localState}
                  set={set}
                  register={register}
                  errors={errors}
                  rhfValues={watchedRHF}
                  participantErrors={participantErrors}
                />
              )}

              {step === 3 && (
                <Step3Confirm
                  state={mergedState}
                  set={set}
                  courses={courses}
                  agreedError={agreedError}
                  onJumpTo={handleJumpTo}
                />
              )}

              {step === 'success' && (
                <ResultSuccess
                  state={mergedState}
                  enrollmentId={enrollmentId}
                  courses={courses}
                  onReset={handleReset}
                />
              )}

              {step === 'fail' && (
                <ResultFail
                  errorMessage={submitError}
                  onRetry={() => handleJumpTo(3)}
                  onBack={() => handleJumpTo(3)}
                />
              )}
            </div>

            {!isResult && (
              <div className="sticky bottom-0 flex gap-3 p-5 border-t border-ink-5 bg-white/90 backdrop-blur-sm">
                {numericStep > 1 && (
                  <Button variant="secondary" className="w-24 flex-shrink-0 h-14" onClick={handleBack}>
                    이전
                  </Button>
                )}
                {numericStep < 3 ? (
                  <Button
                    className="flex-1 h-14"
                    onClick={handleNext}
                    disabled={step === 1 && !localState.courseId}
                  >
                    다음
                  </Button>
                ) : (
                  <Button className="flex-1 h-14" onClick={handleNext} disabled={isPending}>
                    {isPending ? (
                      <>
                        <span className="w-[18px] h-[18px] rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        제출 중…
                      </>
                    ) : (
                      '신청 제출하기'
                    )}
                  </Button>
                )}
              </div>
            )}

            {showLeaveModal && (
              <LeaveModal
                onStay={() => setShowLeaveModal(false)}
                onLeave={() => {
                  setShowLeaveModal(false)
                  handleReset()
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
